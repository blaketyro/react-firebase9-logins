import { Dispatch, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Stack from "react-bootstrap/Stack";
import { createPortal } from "react-dom";
import Box from "./components/Box";

export const defaultModalPortalId = "modal-portal";
export type ModalResult = "success" | "ok" | "cancel" | "exit";
export type ModalComponent = (props: { close: (result: ModalResult) => void }) => ReactNode;
type Modal = { ModalComponent: ModalComponent; onClose?: (result: ModalResult) => void };

// It's possible to have the modal state be a plain ReactNode (JSX.Element) rather than `null | Modal` but that seems
// to be a bad idea according to https://stackoverflow.com/a/53976730 and https://stackoverflow.com/a/66946183.
// So modals work like toasts in that they provide a ModalComponent (aka function) as the state that renders on the fly
// in the ModalPortal. (Having functions as state seems weird to me too but I guess it's better than ReactNodes.)
const ModalContext = createContext<{
	modal: null | Modal;
	setModal: Dispatch<null | Modal>; // Don't need or really want SetStateAction here.
}>({
	modal: null,
	setModal: () => null,
});

const ModalPortal = ({ modalPortalId }: { modalPortalId: string }) => {
	const modalPortal = document.getElementById(modalPortalId);
	const { modal, setModal } = useContext(ModalContext);
	return (
		modalPortal &&
		modal &&
		createPortal(
			<modal.ModalComponent
				close={(result) => {
					modal.onClose?.(result);
					setModal(null);
				}}
			/>,
			modalPortal
		)
	);
};

export const ModalProvider = ({
	modalPortalId = defaultModalPortalId,
	children,
}: {
	modalPortalId?: string;
	children: ReactNode;
}) => {
	const [modal, setModal] = useState<null | Modal>(null);
	const modalContextValue = useMemo(() => ({ modal, setModal }), [modal, setModal]);
	return (
		<ModalContext.Provider value={modalContextValue}>
			{children}
			<ModalPortal modalPortalId={modalPortalId} />
		</ModalContext.Provider>
	);
};

// Making a modal while one is already open will overwrite the first one.
export const useMakeGenericModal = () => {
	const { setModal } = useContext(ModalContext);
	return (ModalComponent: ModalComponent, onClose?: (result: ModalResult) => void) => {
		setModal({ ModalComponent, onClose });
	};
};

export const useMakeFullscreenModal = () => {
	const makeGenericModal = useMakeGenericModal();
	return (ModalComponent: ModalComponent, onClose?: (result: ModalResult) => void) => {
		makeGenericModal(({ close }) => {
			// TODO!!! handle ESC
			return (
				<div className="fullscreen-modal" onClick={() => close("exit")} onKeyUp={(e) => console.log(e)}>
					<ModalComponent close={close} />
				</div>
			);
		}, onClose);
	};
};

//#region Bootstrap Specific Modal Code:

export const useMakeModal = () => {
	const makeFullscreenModal = useMakeFullscreenModal();
	return (title: string, Body: ModalComponent, onClose?: (result: ModalResult) => void) => {
		makeFullscreenModal(
			({ close }) => (
				<Box modal>
					<Stack gap={2}>
						<Stack
							gap={2}
							className="d-flex justify-content-between align-items-center"
							direction="horizontal"
						>
							<h2>{title}</h2>
							<CloseButton onClick={() => close("exit")} />
						</Stack>
						<Body close={close} />
					</Stack>
				</Box>
			),
			onClose
		);
	};
};
export type MakeModal = ReturnType<typeof useMakeModal>;

export const awaitModal = async (makeModal: MakeModal, title: string, Body: ModalComponent) => {
	return new Promise<ModalResult>((resolve) => makeModal(title, Body, resolve));
	// Unfortunately can't just call useMakeModal in here. Would get error:
	// "Invalid hook call. Hooks can only be called inside of the body of a function component. ..."
};

//#endregion
