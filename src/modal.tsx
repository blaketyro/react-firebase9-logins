import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Stack from "react-bootstrap/Stack";
import { createPortal } from "react-dom";
import Box from "./components/Box";

export const defaultModalPortalId = "modal-portal";

// TODO? Have close/ok/cancel situations?
type ModalComponent = (props: { close: () => void }) => ReactNode;

const ModalContext = createContext<{
	shown: boolean;
	setShown: Dispatch<SetStateAction<boolean>>;
	content: ReactNode;
	setContent: Dispatch<SetStateAction<ReactNode>>;
}>({
	shown: false,
	setShown: () => null,
	content: null,
	setContent: () => null,
});

const useCloseModal = () => {
	const { setShown } = useContext(ModalContext);
	return useCallback(() => setShown(false), [setShown]);
};

// Opening a modal while one is already open will overwrite the first one.
export const useOpenGenericModal = () => {
	const { setShown, setContent } = useContext(ModalContext);
	const closeModal = useCloseModal();
	return useCallback(
		(ModalComponent: ModalComponent) => {
			setContent(<ModalComponent close={closeModal} />);
			setShown(true);
		},
		[setShown, setContent, closeModal]
	);
};

export const useOpenFullscreenModal = () => {
	const openGenericModal = useOpenGenericModal();
	return (ModalComponent: ModalComponent) => {
		openGenericModal(({ close }) => {
			return (
				<section className="fullscreen-modal" onClick={close}>
					<ModalComponent close={close} />
				</section>
			);
		});
	};
};

const ModalPortal = ({
	shown,
	content: ModalComponent,
	modalPortalId,
}: {
	shown: boolean;
	content: ReactNode;
	modalPortalId: string;
}) => {
	const modalPortal = document.getElementById(modalPortalId);
	return modalPortal && shown && createPortal(ModalComponent, modalPortal);
};

export const ModalProvider = ({
	children,
	modalPortalId = defaultModalPortalId,
}: {
	children: ReactNode;
	modalPortalId?: string;
}) => {
	const [shown, setShown] = useState(false);
	const [content, setContent] = useState<ReactNode>(null);
	const modalValue = useMemo(
		() => ({ shown, setShown, content, setContent }),
		[shown, setShown, content, setContent]
	);
	return (
		<ModalContext.Provider value={modalValue}>
			{children}
			<ModalPortal shown={modalValue.shown} content={modalValue.content} modalPortalId={modalPortalId} />
		</ModalContext.Provider>
	);
};

//#region Bootstrap Specific Modal Code:

export const useOpenModal = () => {
	// Not using react-bootstrap specific modal since it doesn't style anything or have an onClose to hook into..?
	const openFullscreenModal = useOpenFullscreenModal();
	return (title: string, body?: ReactNode) => {
		openFullscreenModal(({ close }) => {
			return (
				<Box modal>
					<Stack gap={2}>
						<Stack
							gap={2}
							className="d-flex justify-content-between align-items-center"
							direction="horizontal"
						>
							<h2>{title}</h2>
							<CloseButton onClick={close} />
						</Stack>
						{body}
					</Stack>
				</Box>
			);
		});
	};
};

//#endregion
