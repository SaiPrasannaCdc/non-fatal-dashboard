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
  },
  verticalBarPath: (x, y, width, height, cornerWidth, invisible = false, adjustedZero = false) => {

    if(invisible)
    {
      y = y - 1;
    }
    
    if(height == 0 && adjustedZero == true)
    {
      cornerWidth = 0;
      y = y - 1;
      height = 0.5;
    }
    else if(height == 0)
    {
      cornerWidth = 0;
    }
    else if(height < 0.5 && height > 0)
    {
      cornerWidth = 0;
      y = y - 1;
      height = 1;
    }
    else if(height < 1 )
    {
      cornerWidth = 0;
    }
    else if(height < 2 )
    {
      cornerWidth = 2;
    }
    else if(height < 4 )
    {
      cornerWidth = 2.5;
    }
    else if(height < 6 )
    {
      cornerWidth = 5;
    }

    const xEnd = x + width;
    const yEnd = y + height;

    return `M${x + cornerWidth} ${y} 
      L${xEnd - cornerWidth} ${y}
      Q${xEnd} ${y}, ${xEnd} ${y + cornerWidth} 
      L${xEnd} ${yEnd} 
      L${x} ${yEnd}
      L${x} ${y + cornerWidth}
      Q${x} ${y}, ${x + cornerWidth} ${y}`;
  }
}

export default Utils;
