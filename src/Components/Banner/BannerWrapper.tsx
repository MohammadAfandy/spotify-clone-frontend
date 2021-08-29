const BannerWrapper: React.FC = ({ children }) => {
  return (
    <div className="bg-banner-gradient h-full flex justify-center items-center p-2 sm:p-10">
      {children}
    </div>
  );
};

export default BannerWrapper;
