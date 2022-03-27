import { useCallback, useEffect, useRef } from 'react';
import styles from './RangeInput.module.css';

const RangeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  min = 0,
  max = 100,
  value,
  onChange,
  ...props
}) => {

  const wrapperRef = useRef<HTMLDivElement>(null);

  const changeRangeStyle = useCallback((val: number) => {
    const rangeValue = (val - Number(min)) / (Number(max) - Number(min)) * 100;
    wrapperRef.current?.style.setProperty('--rangeValue', `${rangeValue}%`);
  }, [max, min]);

  useEffect(() => {
    changeRangeStyle(Number(value));
  }, [changeRangeStyle, value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeRangeStyle(Number(event.target.value));
    onChange && onChange(event);
  };

  return (
    <div
      className={`${styles.wrapper} ${className}`}
      ref={wrapperRef}
    >
      <input
        type="range"
        className={`${styles.rangeInput}`}
        min={min}
        max={max}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};

export default RangeInput;
