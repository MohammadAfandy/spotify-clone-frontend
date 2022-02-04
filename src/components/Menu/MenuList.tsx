import React, { forwardRef } from 'react';
import { MdExpandMore } from 'react-icons/md';

type MenuListProps = {
  children: React.ReactNode,
  className?: string,
  text: string,
  Icon?: React.ReactNode,
  handleVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isVisible: boolean,
  childPosition?: 'right' | 'left' | 'center',
};

const MenuList = forwardRef<HTMLDivElement, MenuListProps>(({
  children,
  className = '',
  text,
  Icon,
  handleVisible,
  isVisible,
  childPosition = 'center',
}, ref) => {
  let childClass = 'left-0 right-0 mx-auto';
  if (childPosition === 'left') {
    childClass = 'left-0';
  } else if (childPosition === 'right') {
    childClass = 'right-0';
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        className="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm p-2 bg-light-black-1 text-sm hover:bg-black cursor-pointer"
        onClick={() => handleVisible((prevState) => !prevState)}
      >
        {Icon ? (
          <>
            <div className="mr-2">
              {Icon}
            </div>
            <span className="hidden sm:block mr-4">{text}</span>
          </>
        ) : (
          <span className="mr-2">{text}</span>
        )}
        <MdExpandMore className="h-6 w-6" />
      </div>

      {isVisible && (
        <div
          className={`${childClass} absolute mt-2 w-36 sm:w-48 border border-opacity-20 rounded-m bg-light-black-2 focus:outline-none`}
        >
          {children}
        </div>
      )}
    </div>
  );
});

export default MenuList;
