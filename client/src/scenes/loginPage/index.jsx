import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Form from "./Form";
const LoginPage = () => {
	const theme = useTheme();
	const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

	return <Box>
		<Box width="100%" backgroundColor={theme.palette.background.alt} p="1rem  6%" textAlign="center">
		<Typography
			fontWeight="bold"
			fontSize="32px"
			color="primary"
		>
			Socio<span
				style={{
					color: "#06D6A0",
					fontFamily: "cursive"
				}}
			>
				Gram
			</span>
		</Typography>
		</Box>

		<Box
			width={isNonMobileScreens ? "50%" : "93%"}
			p="2rem"
			m="2rem auto"
			borderRadius="1.5rem"
			backgroundColor={theme.palette.background.alt}
		>
			<Typography fontWeight="500" variant="h5" sx={{mb:"1.5rem"}}>
			Fostering Relationships, Crafting Memories – SocioGram: Your Social Media Playground
			</Typography>
			<Form />
		</Box>
	</Box>
}

export default LoginPage;