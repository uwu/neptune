export function appendStyle(style) {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = style;

  document.head.appendChild(styleTag);

  return (newStyle) => {
    if (newStyle == undefined) return document.head.removeChild(styleTag);

    styleTag.innerHTML = newStyle;
  };
};