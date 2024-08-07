import { h } from "preact";
import Button from "./Button";

interface IImportView {
    specs: string
    handleSpecsChange: (event: Event) => void
    handleUpdateButtonClick: () => void
}

export default function ImportView({specs, handleSpecsChange, handleUpdateButtonClick}: IImportView) {
    return (
        <div class="overflow-scroll flex flex-col w-full h-full gap-4 p-4">
            <div class="flex flex-col gap-1 text-sm">
                <p>1. Generate colors on <a href="https://colorbox.io" class="font-medium underline hover:opacity-80" target="_blank" rel="noreferrer noopener">ColorBox.io</a></p>
                <p>2. Choose "Copy JSON" from the <span class="font-bold">Export</span> menu</p>
                <p>3. Paste the JSON below</p>
            </div>

            <textarea
                class="h-full w-full font-mono text-xs fg-default cursor-text p-2 rounded-lg bg-subtle"
                placeholder='Paste JSON from ColorBox.io'
                value={specs}
                onChange={handleSpecsChange}
            />

            <Button label='Generate' onClick={handleUpdateButtonClick}/>
        </div>
    )
}