import React, {useContext, useEffect, useRef} from 'react';
import {
  RGLine,
  RGLink,
  RGUserEvent,
 RelationGraphStoreContext
} from 'relation-graph-react';

import './index.less';


const App= ({ link, line }) => {


  const relationGraph = useContext(RelationGraphStoreContext);
  const options = relationGraph.options;
  const checked = line.id === options?.checkedLineId;

  const showStartArrow = line.showStartArrow ? relationGraph.getArrow(line, link, true) : undefined;
  const showEndArrow = line.showEndArrow ? relationGraph.getArrow(line, link, false) : undefined;

  const pathData = relationGraph.createLinePath(link, line, 0);

  const onClick = (lineObject: RGLine, linkObject: RGLink, $event: React.MouseEvent<SVGGElement>) => {
    relationGraph.onLineClick(lineObject, linkObject, $event as RGUserEvent);
  };


  

  let textTransform = ''
  try {
    textTransform = relationGraph.getTextTransform(
      line,
      pathData.textPosition.x,
      pathData.textPosition.y,
      pathData.textPosition.rotate
    )
  } catch (e) {
    console.log("初始化异常")
  }



  return (


    <g>
     
      <path

        d={pathData?.path}
        className={`c-rg-line ${line.styleClass} ${checked ? 'c-rg-line-checked' : ''}`}
        stroke={checked ? options?.checkedLineColor : line.color ? line.color : options?.defaultLineColor}
        style={{
          opacity: line.opacity,
          strokeWidth: `${line.lineWidth ? line.lineWidth : options?.defaultLineWidth}px`,
        }}
        markerStart={showStartArrow}
        markerEnd={showEndArrow}
        fill="none"
        onClick={(event) => onClick(line, link, event)}
      />
      {options?.defaultShowLineLabel && options?.canvasZoom > 40 && (
        <g transform={textTransform}>
          {/* <rect
            key={`t-${line.seeks_id}`}
            rx="15"
            ry="20"
            x="-35"
            y="-12"
            style={{
              opacity: line.opacity,
              fill: checked ? options?.checkedLineColor : line.fontColor ? line.fontColor : line.color,
            }}
            className="c-rg-line-text-bg"
            onClick={(event) => onClick(line, link, event)}
          /> */}
          <text
            x="-35"
            y="12"
            style={{
              opacity: line.opacity,
            }}
            className="c-rg-line-text"
            onClick={(event) => onClick(line, link, event)}
          >
            {line.text}
          </text>
        </g>
      )}
    </g>
   
  );
};

export default App;
