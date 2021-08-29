import Button from './Button';

type FolllowButtonProps = {
  isFollowed?: boolean;
  onClick?: (event: React.MouseEvent) => void;
};

const defaultProps: FolllowButtonProps = {
  isFollowed: false,
};

const FolllowButton: React.FC<FolllowButtonProps> = ({
  onClick,
  isFollowed,
}) => {
  return (
    <div
      data-tip="follow"
      data-for="login-tooltip"
      data-event="click"
    >
      <Button
        text={isFollowed ? 'Following' : 'Follow'}
        onClick={onClick}
        color={isFollowed ? 'green' : 'white'}
      />
    </div>
  );
};

FolllowButton.defaultProps = defaultProps;

export default FolllowButton;
