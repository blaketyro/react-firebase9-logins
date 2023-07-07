import { Dispatch, ReactNode, createContext, useContext, useMemo, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Stack from "react-bootstrap/Stack";
import { createPortal } from "react-dom";
import Box from "./components/Box";

export const defaultModalPortalId = "modal-portal";
export type ModalResult = "success" | "ok" | "cancel" | "x-button" | "click-out";
export type ModalComponent = (props: { close: (result: ModalResult) => void }) => ReactNode;

const ModalContext = createContext<{
	modal: ReactNode;
	setModal: Dispatch<ReactNode>; // Don't need or really want SetStateAction here.
}>({
	modal: null,
	setModal: () => null,
});

const ModalPortal = ({ modal, modalPortalId }: { modal: ReactNode; modalPortalId: string }) => {
	const modalPortal = document.getElementById(modalPortalId);
	return modalPortal && modal && createPortal(modal, modalPortal);
};

export const ModalProvider = ({
	modalPortalId = defaultModalPortalId,
	children,
}: {
	modalPortalId?: string;
	children: ReactNode;
}) => {
	const [modal, setModal] = useState<ReactNode>(null);
	const modalContextValue = useMemo(() => ({ modal, setModal }), [modal, setModal]);
	return (
		<ModalContext.Provider value={modalContextValue}>
			{children}
			<ModalPortal modal={modalContextValue.modal} modalPortalId={modalPortalId} />
		</ModalContext.Provider>
	);
};

// Making a modal while one is already open will overwrite the first one.
export const useMakeGenericModal = () => {
	const { setModal } = useContext(ModalContext);
	return (ModalComponent: ModalComponent, onClose?: (result: ModalResult) => void) => {
		setModal(
			<ModalComponent
				close={(result) => {
					setModal(null);
					onClose?.(result);
				}}
			/>
		);
	};
};

export const useMakeFullscreenModal = () => {
	const makeGenericModal = useMakeGenericModal();
	return (ModalComponent: ModalComponent, onClose?: (result: ModalResult) => void) => {
		makeGenericModal(
			({ close }) => (
				<section className="fullscreen-modal" onClick={() => close("click-out")}>
					<ModalComponent close={close} />
				</section>
			),
			onClose
		);
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
							<CloseButton onClick={() => close("x-button")} />
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
	// Can't just call useMakeModal in here. Would get error:
	// "Invalid hook call. Hooks can only be called inside of the body of a function component. ..."
};

//#endregion
