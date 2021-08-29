import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Category from '../types/Category';
import { AuthContext } from '../context/auth-context';
import { makeRequest } from '../utils/helpers';

import GridWrapper from '../components/Grid/GridWrapper';

const SearchPage: React.FC = () => {
  const history = useHistory();
  const [categories, setCategories] = useState<Category[]>([]);

  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = { limit: 50 };
        const response = await makeRequest('/browse/categories', { params }, isLoggedIn);
        setCategories(response.data.categories.items);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCategories();
  }, [isLoggedIn]);

  return (
    <div className="px-4 py-4">
      <GridWrapper>
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => history.push('/category/' + category.id)}
          >
            <img
              src={category.icons[0].url}
              alt={category.id}
              className="rounded-xl filter brightness-200"
            />
            <div className="font-bold text-center text-2xl absolute bottom-1 left-1/2 transform -translate-x-1/2 ">
              {category.name}
            </div>
          </div>
        ))}
      </GridWrapper>
    </div>
  );
};

export default SearchPage;
