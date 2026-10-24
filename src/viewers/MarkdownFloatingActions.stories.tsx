import type { Meta, StoryObj } from "storybook-solidjs-vite";
import Captions from "lucide-solid/icons/captions";
import Unlink from "lucide-solid/icons/unlink";
import { createSignal } from "solid-js";
import MarkdownFloatingActions from "./MarkdownFloatingActions";
import styles from "./MarkdownFloatingActions.stories.module.css";

const meta = {
    title: "Components/Markdown floating actions",
    parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Link: Story = {
    render: () => {
        const [href, setHref] = createSignal("../documents/project-notes.md#decisions");
        const [editing, setEditing] = createSignal(false);
        return (
            <div class={styles.stage}>
                <MarkdownFloatingActions
                    kind="link"
                    href={href()}
                    editing={editing()}
                    onEditingChange={setEditing}
                    onNavigate={() => undefined}
                    onSaveHref={(value) => {
                        setHref(value);
                        return true;
                    }}
                    actions={[
                        {
                            label: "Eliminar enlace",
                            icon: () => <Unlink aria-hidden="true" />,
                            onClick: () => undefined,
                        },
                    ]}
                />
            </div>
        );
    },
};

export const Image: Story = {
    render: () => {
        const [href, setHref] = createSignal("./images/architecture-overview.png");
        const [captionVisible, setCaptionVisible] = createSignal(false);
        const [editing, setEditing] = createSignal(false);
        return (
            <div class={styles.stage}>
                <MarkdownFloatingActions
                    kind="image"
                    href={href()}
                    editing={editing()}
                    onEditingChange={setEditing}
                    onNavigate={() => undefined}
                    onSaveHref={(value) => {
                        setHref(value);
                        return true;
                    }}
                    actions={[
                        {
                            label: "Mostrar u ocultar pie de imagen",
                            icon: () => <Captions aria-hidden="true" />,
                            pressed: captionVisible(),
                            onClick: () => setCaptionVisible((visible) => !visible),
                        },
                    ]}
                />
            </div>
        );
    },
};
