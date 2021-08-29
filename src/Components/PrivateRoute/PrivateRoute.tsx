import { useContext } from 'react';
import { Route } from "react-router-dom";
import { AuthContext } from '../../context/auth-context';

import UnauthorizedPage from '../../pages/UnauthorizedPage';

type PrivateRouteProps = {
  component: React.ElementType;
  exact: boolean;
  path: string;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {

  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) => (
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <UnauthorizedPage />
        )
      )}
    />
  );
};

export default PrivateRoute;
