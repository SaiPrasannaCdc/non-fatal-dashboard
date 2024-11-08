const Utils = {
  horizontalBarPath: (rightRounded, x, y, width, height, strokeWidth, cornerWidth) => {
    const xEnd = x + width;
    const yEnd = y + height;
    
    return rightRounded ?
      `M${x} ${y} 
      L${xEnd - cornerWidth} ${y}
      Q${xEnd} ${y}, ${xEnd} ${y + cornerWidth} 
      L${xEnd} ${yEnd - cornerWidth} 
      Q${xEnd} ${yEnd}, ${xEnd - cornerWidth} ${yEnd}
      L${x} ${y + height} 
      L${x} ${y - (strokeWidth / 2)}`
    :
      `M${x + cornerWidth} ${y} 
      L${xEnd} ${y} 
      L${xEnd} ${yEnd} 
      L${x + cornerWidth} ${yEnd} 
      Q${x} ${yEnd}, ${x} ${yEnd - cornerWidth}
      L${x} ${y + cornerWidth}
      Q${x} ${y}, ${x + cornerWidth} ${y}`
  }
}

export default Utils;
