import { ReactNode } from "react";
import Stack from "react-bootstrap/Stack";

function Box({ children }: { children?: ReactNode }) {
	return <Stack className="box rounded border p-4">{children}</Stack>;
}

export default Box;
