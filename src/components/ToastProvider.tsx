"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

export const ToastProvider: React.FC = () => {
	return (
		<Toaster
			position="top-right"
			reverseOrder={false}
			gutter={10}
			containerClassName="z-[9999]"
			toastOptions={{
				duration: 4000,
				className: "font-sans",
				style: {
					background: "rgba(15, 23, 42, 0.95)",
					color: "#f8fafc",
					backdropFilter: "blur(16px)",
					WebkitBackdropFilter: "blur(16px)",
					border: "1px solid rgba(255, 255, 255, 0.15)",
					borderRadius: "16px",
					padding: "12px 18px",
					boxShadow:
						"0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.15)",
					fontSize: "13px",
					fontWeight: 600,
					letterSpacing: "-0.01em",
					maxWidth: "420px",
				},
				success: {
					iconTheme: {
						primary: "#10b981",
						secondary: "#ffffff",
					},
					style: {
						border: "1px solid rgba(16, 185, 129, 0.4)",
						boxShadow:
							"0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(16, 185, 129, 0.25)",
					},
				},
				error: {
					iconTheme: {
						primary: "#f43f5e",
						secondary: "#ffffff",
					},
					style: {
						border: "1px solid rgba(244, 63, 94, 0.4)",
						boxShadow:
							"0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(244, 63, 94, 0.25)",
					},
				},
			}}
		/>
	);
};
