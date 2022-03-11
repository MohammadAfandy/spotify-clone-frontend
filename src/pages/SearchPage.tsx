import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Category from '../types/Category';
import { AuthContext } from '../context/auth-context';
import { makeRequest } from '../utils/helpers';

import GridWrapper from '../components/Grid/GridWrapper';
import CardItem from '../components/Card/CardItem';

import cardStyles from '../components/Card/Card.module.css';

const SearchPage: React.FC = () => {
  const history = useHistory();
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const params = { limit: 50 };
        const response = await makeRequest('/browse/categories', { params }, isLoggedIn);
        setCategories(response.data.categories.items);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [isLoggedIn]);

  const CardLoading = (
    [...Array(20)].map((_, idx) => (
      <CardItem key={idx} isLoading />
    ))
  );

  return (
    <div className="px-4 py-4">
      <GridWrapper>
        {isLoading && CardLoading}
        {!isLoading && categories.map((category) => (
          <div
            key={category.id}
            className={`${cardStyles.cardItem} relative cursor-pointer transition duration-300 ease-in-out transform hover:scale-105`}
            onClick={() => history.push('/category/' + category.id)}
          >
            <img
              src={category.icons[0].url}
              alt={category.id}
              className="rounded-xl filter brightness-200 h-full w-full"
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
