const UnauthorizedPage: React.FC = () => {
  return (
    <div className="p-4">
      <div className="text-4xl font-bold mb-4">
        401 Unauthorized
      </div>
      <div className="font-light">
        You need to login to access this page.
      </div>
    </div>
  );
};

export default UnauthorizedPage;
