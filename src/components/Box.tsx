import { ReactNode } from "react";
import Stack from "react-bootstrap/Stack";

const Box = ({ wide, children }: { wide?: boolean; children?: ReactNode }) => {
	return <Stack className={`${wide ? "wide-box" : "box"} rounded border p-4`}>{children}</Stack>;
};

export default Box;
