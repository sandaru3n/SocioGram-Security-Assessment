import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from '../state';
import FlexBetween from './flexBetween';
import UserImage from './UserImage';

const Friend = ({ friendId, name, subtitle, userPicturePath }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { _id } = useSelector((state) => state.user);
	const token = useSelector((state) => state.token);
	const friends = useSelector((state) => state.user.friends);

	const { palette } = useTheme();
	const primaryLight = palette.primary.light;
	const primaryDark = palette.primary.dark;
	const main = palette.neutral.main;
	const medium = palette.neutral.medium;

	const isFriend = Array.isArray(friends) && friends.includes(friendId);

	const toggleFriend = async () => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/users/${_id}/${friendId}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to update friend status: ${response.statusText}`);
			}

			const data = await response.json();

			// Assuming that the response data is an updated list of friends
			dispatch(setFriends({ friends: data }));

		} catch (error) {
			console.error("Error toggling friend status:", error);
			// Handle the error as needed, for example, show a message to the user or log it
		}
	};

	return (
		<FlexBetween>
			<FlexBetween gap="1rem">
				<UserImage image={userPicturePath} size="55px" />
				<Box
					onClick={() => {
						navigate(`/profile/${friendId}`);
						navigate(0);
					}}
				>
					<Typography
						color={main}
						variant="h5"
						fontWeight="500"
						sx={{
							"&:hover": {
								color: palette.primary.light,
								cursor: "pointer",
							},
						}}
					>
						{name}
					</Typography>
					<Typography color={medium} fontSize="0.75rem">
						{subtitle}
					</Typography>
				</Box>
			</FlexBetween>
			<IconButton
				onClick={() => toggleFriend()}
				sx={{ backgroundColor: primaryLight, p: "0.6rem" }}
			>
				{isFriend ? (
					<PersonRemoveOutlined sx={{ color: primaryDark }} />
				) : (
					<PersonAddOutlined sx={{ color: primaryDark }} />
				)}
			</IconButton>
		</FlexBetween>
	);
};

export default Friend;
