import { ReactNode } from "react";
import Stack from "react-bootstrap/Stack";

const Box = ({ wide, modal, children }: { wide?: boolean; modal?: boolean; children?: ReactNode }) => {
	return (
		<Stack
			className={`${wide ? "wide-box" : "box"} ${modal ? "modal-box" : ""} rounded border p-4`}
			onClick={modal ? (e) => e.stopPropagation() : undefined}
		>
			{children}
		</Stack>
	);
};

export default Box;
