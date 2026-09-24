import { Box } from '@mui/material';

const UserImage = ({ image, size = "60px" }) => {
	const isFullUrl = image && (image.startsWith('http://') || image.startsWith('https://'));
	const imageSrc = isFullUrl ? image : `${process.env.REACT_APP_BACKEND_URL}/assets/${image}`;

	return (

		<Box
			width={size} height={size}
		>
			<img
				style={{ objectFit: "cover", borderRadius: "50%" }}
				width={size} height={size}
				alt="user"
				src={imageSrc}
				referrerPolicy="no-referrer"
			/>
		</Box>
	);
}
// use exp shortcut for this export default
export default UserImage;