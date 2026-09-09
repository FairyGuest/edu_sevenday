interface ZYIconProps {
  type: string;
  color?: string;
  size?: string | number;
  style?: React.CSSProperties;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}
function ZYIcon({
  type,
  style,
  color,
  size,
  className = "",
  onClick = () => {},
}: ZYIconProps) {
  return (
    <svg
      className={"icon svg-icon " + className}
      aria-hidden="true"
      style={{ fontSize: size, color, ...style }}
      onClick={onClick}
    >
      <use xlinkHref={`#icon-${type}`} />
    </svg>
  );
}

export default ZYIcon;
