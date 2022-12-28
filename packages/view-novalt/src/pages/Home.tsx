import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Home() {
	const navigate = useNavigate();
	return (
		<>
			<h1>Hello! I'm home!</h1>
			<button onClick={() => navigate('/login/sopia')}>Login</button>
		</>
	);
}