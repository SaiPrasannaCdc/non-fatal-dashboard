// import { useEffect, useState } from 'react';
import { Polygon } from '@visx/shape';
import { Group } from '@visx/group';

function ChangeIndicator(params) {
    const {colorScale, defaultValueIfEmpty, percentValue, label, defaultLabelIfEmpty, width, height } = params;
    const upArrayPoints  = [
        { x: width /2, y: height/10 },
        { x: width * 0.95, y: height*0.40 },
        { x: width * 0.75, y: height*0.4},
        { x: width*0.75, y: height*0.85},
        { x: width*0.25, y: height*0.85},
        { x: width*0.25, y: height*0.4},
        { x: width* 0.05, y: height*0.4}
      ];

    const decreaseArrayPoints  = [
        { x: width*0.5, y: height*0.9 },
        { x: width*0.05, y: height*0.6 },
        { x: width*0.25, y: height*0.6 },
        { x: width*0.25, y: height*0.15 },
        { x: width*0.75, y: height*0.15 },
        { x: width*0.75, y: height*0.6 },
        { x: width*0.95, y: height*0.6 },
      ];

    return (<>
        <svg width={width} height={height} id='upArrow'>
            <Group>
                <Polygon
                    sides={3}
                    size={70}
                    rotate={0}
                    center={{ x: 50, y: 50 }}
                    points={
                        percentValue > 0 ? 
                        upArrayPoints.map(p => [p.x, p.y]):
                        (percentValue == 0 ? [] : decreaseArrayPoints.map(p => [p.x, p.y]))}
                    fill={colorScale[defaultValueIfEmpty(label, defaultLabelIfEmpty)]}
                ></Polygon>
                <text x={percentValue == 0 ? width/2 + 5 : width/2} y={percentValue > 0 ? height/2 + 5: height/2} textAnchor="middle" fontSize={percentValue == 0 ? 16 : 13}
                    stroke={percentValue == 0 ? colorScale[defaultValueIfEmpty(label, defaultLabelIfEmpty)] :'#fff'} fontWeight="normal"
                >
                    {Math.abs(percentValue).toFixed(1)}%
                </text>
            </Group>
        </svg>
    </>);
}
export default ChangeIndicator;