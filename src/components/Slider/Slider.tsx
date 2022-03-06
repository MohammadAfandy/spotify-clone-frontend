import { useRef } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

type SliderProps = {
  className?: string;
};

const defaultProps: SliderProps = {
  className: '',
};

const offset = 800;

const Slider: React.FC<SliderProps> = ({
  children,
  className,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const handlePreviousSlider = () => {
    sliderRef.current && (sliderRef.current.scrollBy({
      left: -offset,
      behavior: 'smooth'
    }));
  }
  const handleNextSlider = () => {
    sliderRef.current && (sliderRef.current.scrollBy({
      left: offset,
      behavior: 'smooth'
    }));
  }

  return (
    <div className="group-slider relative overflow-x-hidden">
      <div
        className={`bg-black bg-opacity-50 cursor-pointer absolute z-10 top-0 bottom-0 left-0 hidden canhover:group-slider-hover:block`}
        onClick={handlePreviousSlider}
      >
        <MdChevronLeft className="w-10 h-full" />
      </div>
      <div
        className={`bg-black bg-opacity-50 cursor-pointer absolute z-10 top-0 bottom-0 right-0 hidden canhover:group-slider-hover:block`}
        onClick={handleNextSlider}
      >
        <MdChevronRight className="w-10 h-full" />
      </div>
      <div
        className={`no-scrollbar transition duration-300 ease-in flex gap-x-4 overflow-x-auto ${className}`}
        ref={sliderRef}
      >
        {children}
      </div>
    </div>
  )
};

Slider.defaultProps = defaultProps;

export default Slider;
