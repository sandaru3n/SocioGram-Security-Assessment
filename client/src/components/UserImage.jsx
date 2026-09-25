import { Box } from '@mui/material';
import ProtectedImage from './ProtectedImage';

const UserImage = ({ image, size = "60px" }) => {
	const isFullUrl = image && (image.startsWith('http://') || image.startsWith('https://'));
	const imageSrc = !image
		? ""
		: isFullUrl
			? image
			: `${process.env.REACT_APP_BACKEND_URL}/assets/${image}`;

	return (
		<Box width={size} height={size}>
			<ProtectedImage
				style={{ objectFit: "cover", borderRadius: "50%" }}
				width={size}
				height={size}
				alt="user"
				src={imageSrc}
				referrerPolicy="no-referrer"
			/>
		</Box>
	);
};

export default UserImage;
