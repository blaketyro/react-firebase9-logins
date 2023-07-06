import { Dispatch, ReactNode, createContext, useContext, useMemo, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Stack from "react-bootstrap/Stack";
import { createPortal } from "react-dom";
import Box from "./components/Box";

export const defaultModalPortalId = "modal-portal";
export type ModalResult = "success" | "ok" | "cancel" | "x-button" | "click-out";
export type ModalComponent = (props: { close: (result: ModalResult) => void }) => ReactNode;

// Opening a modal while one is already open will overwrite the first one.
const ModalContext = createContext<{
	modal: ReactNode;
	setModal: Dispatch<ReactNode>; // Don't need or really want SetStateAction here.
}>({
	modal: null,
	setModal: () => null,
});

// const useSetModal = () => useContext(ModalContext).setModal;

// const useCloseModal = () => {
// 	const { setModal } = useContext(ModalContext);
// 	return useCallback(() => setModal(null), [setModal]);
// };

// export const useOpenGenericModal = () => {
// 	const { setModal } = useContext(ModalContext);
// 	return useCallback(
// 		(ModalComponent: ModalComponent) => {
// 			setModal(<ModalComponent close={closeModal} />);
// 		},
// 		[setContent, closeModal]
// 	);
// };

// want to return a function that takes in a MC

// send the close reason back with a function sent as a prop, right

// like

// useOpenModal("title", (close) => <p>x button close</p>, onClose=(modalResult: string) => { /* do stuff */})

// export const useOpenFullscreenModal = () => {
// 	const { setModal } = useContext(ModalContext);
// 	const close = () => setModal(null);

// 	return (ModalComponent: ModalComponent) => {
// 		setModal(
// 			<section className="fullscreen-modal" onClick={() => close(""))}>
// 				<ModalComponent close={close} />
// 			</section>
// 		);
// 	};
// };

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
};

// export const useOpenModal = () => {
// 	// Not using react-bootstrap specific modal since it doesn't style anything or have an onClose to hook into..?
// 	const openFullscreenModal = useOpenFullscreenModal();
// 	return (title: string, body?: ReactNode) => {
// 		openFullscreenModal(({ close }) => {
// 			return (
// 				<Box modal>
// 					<Stack gap={2}>
// 						<Stack
// 							gap={2}
// 							className="d-flex justify-content-between align-items-center"
// 							direction="horizontal"
// 						>
// 							<h2>{title}</h2>
// 							<CloseButton onClick={close} />
// 						</Stack>
// 						{body}
// 					</Stack>
// 				</Box>
// 			);
// 		});
// 	};
// };

//#endregion
