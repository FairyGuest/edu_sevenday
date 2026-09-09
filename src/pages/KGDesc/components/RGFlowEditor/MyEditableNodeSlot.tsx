// MyEditableNodeSlot.tsx
import React, { useState, useEffect, useRef } from 'react';
import { RelationGraphInstance, RGNode } from 'relation-graph-react';
import './MyEditableNodeSlot.less';

interface MyEditableNodeSlotProps {
  graphInstance: RelationGraphInstance;
  enableEditingMode: boolean;
  node: RGNode;
  onNodeTextChange: (node: RGNode, newNodeText: string) => void;
}

const MyEditableNodeSlot: React.FC<MyEditableNodeSlotProps> = ({ graphInstance, enableEditingMode, node, onNodeTextChange }) => {
  const [editing, setEditing] = useState(false);
  const [nodeText, setNodeText] = useState<string>(node.text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const checked = graphInstance.options.checkedNodeId === node.id;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const startEditNodeText = (e: any) => {
    // 处理冒泡事件
    e.stopPropagation();
    if (!enableEditingMode) return;
    setNodeText(node.text!);
    setEditing(true);
  };
  const stopEditNodeText = () => {
    setEditing(false);
    // Assuming a context or event bus is used to emit events in the React version
    console.log('onNodeTextChange', node, nodeText);
    onNodeTextChange(node, nodeText);
  };

  return (
    <div className={`my-node ${enableEditingMode && 'my-node-editable'}`}>
      {enableEditingMode && editing && checked
        ? (
          <input
            ref={inputRef}
            value={nodeText}
            onChange={(e) => setNodeText(e.target.value)}
            onBlur={stopEditNodeText}
          />
        )
        : (
          <div
            className="my-node-text"
            title={enableEditingMode ? '双击编辑' : undefined}
            style={{ color: node.fontColor }}
            onDoubleClick={(e) => startEditNodeText(e)}
          >
            {node.text}
          </div>
        )}
    </div>
  );
};

export default MyEditableNodeSlot;
