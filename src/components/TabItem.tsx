import { h } from "preact"

interface ITabItem {
    label: string
    selected: boolean
    onClick: () => void
}

export default function TabItem({ label, selected, onClick }: ITabItem) {
    return (
        <div class={`px-2 py-3 cursor-pointer hover:fg-default ${selected ? 'fg-default font-semibold' : 'fg-muted'}`} onClick={onClick}>
            <p class="text-sm">{label}</p>
        </div>
    )
}