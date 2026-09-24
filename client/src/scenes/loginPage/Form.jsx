import { useState } from "react";
import {
	Box,
	Button,
	TextField,
	useMediaQuery,
	Typography,
	useTheme,
	Snackbar,
	Alert,
	CircularProgress,
	Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";
import FlexBetween from '../../components/flexBetween';
import axios from 'axios';
import { GoogleLogin } from "@react-oauth/google";


const registerSchema = yup.object().shape({
	firstName: yup
		.string()
		.trim()
		.min(2, "First name must be at least 2 characters")
		.max(50, "First name cannot exceed 50 characters")
		.required("First name is required"),
	lastName: yup
		.string()
		.trim()
		.min(2, "Last name must be at least 2 characters")
		.max(50, "Last name cannot exceed 50 characters")
		.required("Last name is required"),
	email: yup
		.string()
		.trim()
		.email("Please provide a valid email address")
		.required("Email is required"),
	password: yup
		.string()
		.min(6, "Password must be at least 6 characters")
		.required("Password is required"),
	location: yup
		.string()
		.trim()
		.required("Location is required"),
	occupation: yup
		.string()
		.trim()
		.required("Occupation is required"),
	picture: yup
		.mixed()
		.required("Profile picture is required"),
});

const loginSchema = yup.object().shape({
	email: yup
		.string()
		.trim()
		.email("Please provide a valid email address")
		.required("Email is required"),
	password: yup
		.string()
		.required("Password is required"),
});

const initialValuesRegister = {
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	location: "",
	occupation: "",
	picture: "",
};

const initialValuesLogin = {
	email: "",
	password: "",
};

const Form = () => {
	const [pageType, setPageType] = useState("login");
	const [toast, setToast] = useState({
		open: false,
		message: "",
		severity: "info", // "success" | "error" | "info" | "warning"
	});

	const { palette } = useTheme();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const isNonMobile = useMediaQuery("(min-width:600px)");
	const isLogin = pageType === "login";
	const isRegister = pageType === "register";

	const showNotification = (message, severity = "info") => {
		setToast({
			open: true,
			message,
			severity,
		});
	};

	const handleCloseToast = (event, reason) => {
		if (reason === "clickaway") return;
		setToast((prev) => ({ ...prev, open: false }));
	};

	const register = async (values, onSubmitProps) => {
		try {
			const formData = new FormData();
			for (let value in values) {
				formData.append(value, values[value]);
			}

			const savedUserResponse = await fetch(
				`${process.env.REACT_APP_BACKEND_URL}/auth/register`,
				{
					method: "POST",
					body: formData,
					credentials: "include",
				}
			);
			const savedUserData = await savedUserResponse.json();

			if (!savedUserResponse.ok) {
				const errorMsg =
					savedUserData.error ||
					savedUserData.message ||
					savedUserData.msg ||
					"Registration failed. Please try again.";
				showNotification(errorMsg, "error");
				return;
			}

			onSubmitProps.resetForm();
			showNotification("Account registered successfully! Please sign in.", "success");
			setPageType("login");
		} catch (error) {
			console.error("Register Error:", error);
			showNotification("Network or server connection error. Please try again.", "error");
		} finally {
			onSubmitProps.setSubmitting(false);
		}
	};

	const login = async (values, onSubmitProps) => {
		try {
			const loggedInResponse = await axios.post(
				`${process.env.REACT_APP_BACKEND_URL}/auth/login`,
				{
					email: values.email,
					password: values.password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
				}
			);

			const loggedIn = loggedInResponse.data;

			if (loggedIn && loggedIn.user) {
				showNotification("Login successful! Redirecting...", "success");
				dispatch(
					setLogin({
						user: loggedIn.user,
					})
				);
				onSubmitProps.resetForm();
				setTimeout(() => {
					navigate("/home");
				}, 600);
			} else {
				showNotification("Unexpected response from server. Please try again.", "error");
			}
		} catch (error) {
			console.error("Login Error:", error);
			const errorMsg =
				error.response?.data?.msg ||
				error.response?.data?.error ||
				error.response?.data?.message ||
				"Invalid email or password. Please try again.";
			showNotification(errorMsg, "error");
		} finally {
			onSubmitProps.setSubmitting(false);
		}
	};

	const handleFormSubmit = async (values, onSubmitProps) => {
		if (isLogin) await login(values, onSubmitProps);
		if (isRegister) await register(values, onSubmitProps);
	};

	/* GOOGLE OAUTH HANDLERS
	 * handleGoogleSuccess â€” called by GoogleLogin when Google returns a credential (ID token).
	 * We forward the token to our backend POST /auth/google which verifies it with Google's
	 * public keys and either creates a new account or logs in the existing one, then sets
	 * the same HTTP-only JWT cookie used by all other authenticated requests.
	 */
	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			const response = await axios.post(
				`${process.env.REACT_APP_BACKEND_URL}/auth/google`,
				{ credential: credentialResponse.credential },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true, // Ensures the JWT cookie is stored by the browser
				}
			);
			const data = response.data;
			if (data && data.user) {
				showNotification("Google sign-in successful! Redirecting...", "success");
				dispatch(setLogin({ user: data.user }));
				setTimeout(() => {
					navigate("/home");
				}, 600);
			}
		} catch (error) {
			console.error("Google OAuth error:", error);
			const errorMsg =
				error.response?.data?.error ||
				error.response?.data?.message ||
				"Google sign-in failed. Please try again.";
			showNotification(errorMsg, "error");
		}
	};

	const handleGoogleError = () => {
		showNotification("Google sign-in was cancelled or failed. Please try again.", "error");
	};


	return (
		<>
			<Formik
				key={pageType}
			onSubmit={handleFormSubmit}
			initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
			validationSchema={isLogin ? loginSchema : registerSchema}
		>
			{({
				values,
				errors,
				touched,
				handleBlur,
				handleChange,
				handleSubmit,
				setFieldValue,
				resetForm,
				isSubmitting,
			}) => (
				<form onSubmit={handleSubmit}>
					<Box
						display="grid"
						gap="30px"
						gridTemplateColumns="repeat(4, minmax(0, 1fr))"
						sx={{
							"& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
						}}
					>
						{isRegister && (
							<>
								<TextField
									label="First Name"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.firstName}
									name="firstName"
									error={
										Boolean(touched.firstName) && Boolean(errors.firstName)
									}
									helperText={touched.firstName && errors.firstName}
									sx={{ gridColumn: "span 2" }}
								/>
								<TextField
									label="Last Name"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.lastName}
									name="lastName"
									error={Boolean(touched.lastName) && Boolean(errors.lastName)}
									helperText={touched.lastName && errors.lastName}
									sx={{ gridColumn: "span 2" }}
								/>
								<TextField
									label="Location"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.location}
									name="location"
									error={Boolean(touched.location) && Boolean(errors.location)}
									helperText={touched.location && errors.location}
									sx={{ gridColumn: "span 4" }}
								/>
								<TextField
									label="Occupation"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.occupation}
									name="occupation"
									error={
										Boolean(touched.occupation) && Boolean(errors.occupation)
									}
									helperText={touched.occupation && errors.occupation}
									sx={{ gridColumn: "span 4" }}
								/>
								<Box
									gridColumn="span 4"
									border={`1px solid ${
										Boolean(touched.picture) && Boolean(errors.picture)
											? palette.error.main
											: palette.neutral.medium
									}`}
									borderRadius="5px"
									p="1rem"
								>
									<Dropzone
										accept={{
											"image/jpeg": [".jpg", ".jpeg"],
											"image/png": [".png"],
											"image/webp": [".webp"],
										}}
										maxSize={2 * 1024 * 1024}
										multiple={false}
										onDrop={(acceptedFiles) => {
											if (acceptedFiles[0]) {
												setFieldValue("picture", acceptedFiles[0]);
											}
										}}
										onDropRejected={() =>
											showNotification("Only JPEG, PNG, or WebP images up to 2MB are allowed", "warning")
										}
									>
										{({ getRootProps, getInputProps }) => (
											<Box
												{...getRootProps()}
												border={`2px dashed ${
													Boolean(touched.picture) && Boolean(errors.picture)
														? palette.error.main
														: palette.primary.main
												}`}
												p="1rem"
												sx={{ "&:hover": { cursor: "pointer" } }}
											>
												<input {...getInputProps()} />
												{!values.picture ? (
													<Typography color={Boolean(touched.picture) && Boolean(errors.picture) ? "error" : "inherit"}>
														Add Profile Picture Here *
													</Typography>
												) : (
													<FlexBetween>
														<Typography>{values.picture.name}</Typography>
														<EditOutlinedIcon />
													</FlexBetween>
												)}
											</Box>
										)}
									</Dropzone>
									{Boolean(touched.picture) && Boolean(errors.picture) && (
										<Typography color="error" variant="caption" sx={{ mt: "0.5rem", display: "block" }}>
											{errors.picture}
										</Typography>
									)}
								</Box>
							</>
						)}

						<TextField
							label="Email"
							onBlur={handleBlur}
							onChange={handleChange}
							value={values.email}
							name="email"
							error={Boolean(touched.email) && Boolean(errors.email)}
							helperText={touched.email && errors.email}
							sx={{ gridColumn: "span 4" }}
						/>
						<TextField
							label="Password"
							type="password"
							onBlur={handleBlur}
							onChange={handleChange}
							value={values.password}
							name="password"
							error={Boolean(touched.password) && Boolean(errors.password)}
							helperText={touched.password && errors.password}
							sx={{ gridColumn: "span 4" }}
						/>
					</Box>

					{/* BUTTONS */}
					<Box>
						<Button
							fullWidth
							type="submit"
							disabled={isSubmitting}
							sx={{
								m: "2rem 0",
								p: "1rem",
								backgroundColor: palette.primary.main,
								color: palette.background.alt,
								"&:hover": { color: palette.primary.main },
							}}
						>
							{isSubmitting ? (
								<CircularProgress size={24} color="inherit" />
							) : isLogin ? (
								"LOGIN"
							) : (
								"REGISTER"
							)}
						</Button>
					{/* GOOGLE SIGN-IN — shown only on the login page.
					    Uses OpenID Connect via Google Identity Services.
					    On success the credential (ID token) is sent to POST /auth/google */}
					{isLogin && (
						<Box>
							<Divider sx={{ my: "1rem" }}>
								<Typography
									variant="body2"
									sx={{ color: palette.neutral.medium, px: 1 }}
								>
									OR CONTINUE WITH
								</Typography>
							</Divider>
							<Box display="flex" justifyContent="center" mt="0.5rem" mb="1rem">
								<GoogleLogin
									onSuccess={handleGoogleSuccess}
									onError={handleGoogleError}
									useOneTap={false}
									theme={palette.mode === "dark" ? "filled_black" : "outline"}
									shape="rectangular"
									size="large"
									text="signin_with_google"
									logo_alignment="left"
								/>
							</Box>
						</Box>
					)}
						<Typography
							onClick={() => {
								setPageType(isLogin ? "register" : "login");
								resetForm();
							}}
							sx={{
								textDecoration: "underline",
								color: palette.primary.main,
								"&:hover": {
									cursor: "pointer",
									color: palette.primary.light,
								},
							}}
						>
							{isLogin
								? "Don't have an account? Sign Up here."
								: "Already have an account? Login here."}
						</Typography>
					</Box>
				</form>
			)}
		</Formik>

		{/* FEEDBACK POPUP MESSAGE */}
		<Snackbar
			open={toast.open}
			autoHideDuration={5000}
			onClose={handleCloseToast}
			anchorOrigin={{ vertical: "top", horizontal: "center" }}
		>
			<Alert
				onClose={handleCloseToast}
				severity={toast.severity}
				variant="filled"
				sx={{ width: "100%", boxShadow: 3 }}
			>
				{toast.message}
			</Alert>
		</Snackbar>
	</>
	);
};

export default Form;
