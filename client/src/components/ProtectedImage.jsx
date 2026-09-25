import { useEffect, useState } from "react";

/**
 * Loads /assets media with the session cookie so unauthorized browsers
 * cannot open the same URL without auth.
 */
const ProtectedImage = ({
	src,
	alt = "",
	width,
	height,
	style,
	className,
	referrerPolicy,
}) => {
	const [objectUrl, setObjectUrl] = useState(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let revoked = false;
		let createdUrl = null;

		const load = async () => {
			setFailed(false);
			setObjectUrl(null);

			if (!src) return;

			// External URLs (e.g. Google profile photos) stay as-is.
			if (/^https?:\/\//i.test(src) && !src.includes("/assets/")) {
				if (!revoked) setObjectUrl(src);
				return;
			}

			try {
				const response = await fetch(src, {
					credentials: "include",
				});
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				const blob = await response.blob();
				createdUrl = URL.createObjectURL(blob);
				if (!revoked) setObjectUrl(createdUrl);
			} catch {
				if (!revoked) setFailed(true);
			}
		};

		load();

		return () => {
			revoked = true;
			if (createdUrl) URL.revokeObjectURL(createdUrl);
		};
	}, [src]);

	if (failed || !src) return null;
	if (!objectUrl) {
		return (
			<div
				className={className}
				style={{
					width: width || "100%",
					height: height || "auto",
					minHeight: height || undefined,
					backgroundColor: "rgba(0,0,0,0.06)",
					borderRadius: style?.borderRadius,
					...style,
				}}
				aria-hidden
			/>
		);
	}

	return (
		<img
			src={objectUrl}
			alt={alt}
			width={width}
			height={height}
			style={style}
			className={className}
			referrerPolicy={referrerPolicy}
		/>
	);
};

export default ProtectedImage;
