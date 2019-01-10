import { render } from 'react-dom';
import * as React from 'react';
// @ts-ignore
import { useSpring, animated as a } from 'react-spring/hooks.cjs';
import './FlipCard.less';

interface FlipCardProps {
  flipped: boolean;
  front: React.ReactElement<any>;
  back: React.ReactElement<any>;
  orientation?: 'X' | 'Y';
}

// inspired by: https://codesandbox.io/embed/01yl7knw70
const FlipCard: React.FunctionComponent<FlipCardProps> = ({
  front,
  back,
  flipped,
  orientation = 'Y',
}) => {
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotate${orientation}(${
      flipped ? 180 : 0
    }deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });
  return (
    <div>
      <a.div
        className="flip-card back"
        style={{
          transform,
          opacity: (opacity as any).interpolate((o: number) => 1 - o),
        }}
      >
        {back}
      </a.div>
      <a.div
        className="flip-card front"
        style={{
          opacity,
          transform: (transform as any).interpolate(
            // tslint:disable-line no-console
            (t: string) => `${t} rotate${orientation}(180deg)`
          ),
        }}
      >
        {front}
      </a.div>
    </div>
  );
};

export default FlipCard;
