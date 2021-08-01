import { Edit2 } from 'react-feather';

type NavbarItemProps = {
  Icon?: React.ReactNode,
  image?: string,
  text: string,
  editable?: boolean,
  onClick?: (e: React.MouseEvent) => void,
  onClickEdit?: (e: React.MouseEvent) => void,
};

const defaultProps: NavbarItemProps = {
  text: '',
  editable: false,
};

const NavbarItem: React.FC<NavbarItemProps> = ({ Icon, text, image, editable, onClick, onClickEdit }) => {
  return (
    <li
      className="group flex px-6 py-2 cursor-pointer text-sm items-center text-gray-400 rounded-md hover:text-white"
      onClick={onClick}
    >
      {(Icon || image) && (
        <div className="mr-4">
          {Icon && Icon}
          {image && <img src={image} alt={text} className="w-6 h-6 rounded-sm" />}
        </div>
      )}
      <div className="mr-auto truncate">
        {text}
      </div>
      {editable && (
        <div className="group-hover:block hidden">
          <Edit2 className="w-4 h-4" onClick={onClickEdit} />
        </div>
      )}
    </li>
  );
};

NavbarItem.defaultProps = defaultProps;

export default NavbarItem;
