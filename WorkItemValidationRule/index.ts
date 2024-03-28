import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./src/App";

export class WorkItemValidationRule implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private container: HTMLDivElement;
    private imgElement: HTMLImageElement;
    private imgElement1:HTMLImageElement;
    private imgElement2:HTMLImageElement;

    private imageUrl: string;
    private imageUrl1: string;
    private imageUrl2: string;

    constructor() {}

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void {
        this.imgElement = document.createElement("img");
        this.imgElement1 = document.createElement("img");
        this.imgElement2 = document.createElement("img");
        console.log("Work item initttt", context);
        console.log("thread one");
        

        context.resources.getResource("delete.png", this.setImage.bind(this, false, "png"), this.showError.bind(this));
        context.resources.getResource("delete.png", this.setImage.bind(this, false, "png"), this.showError.bind(this));
		context.resources.getResource("delete.png", this.setImage.bind(this, false, "png"), this.showError.bind(this));

        container.appendChild(this.imgElement);
        container.appendChild(this.imgElement1);
		container.appendChild(this.imgElement2);

        this.container = container;
    }

    private setImage(shouldUpdateOutput:boolean, fileType: string, fileContent: string): void
	{
        this.imageUrl = this.generateImageSrcUrl(fileType, fileContent);
        this.imageUrl1 = this.generateImageSrcUrl(fileType, fileContent);
        this.imageUrl2 = this.generateImageSrcUrl(fileType, fileContent);

        console.log("DFEFUEHUEF", this.imageUrl)
        this.imgElement.src = this.imageUrl;
        this.imgElement1.src = this.imageUrl1;
        this.imgElement2.src = this.imageUrl2;

        this.updateView();
        
	}

    private generateImageSrcUrl(fileType: string, fileContent: string): string
	{
		return  "data:image/" + fileType + ";base64, " + fileContent;
	}

    private showError(): void
	{
        console.log('error occur');
        
	}
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context?: ComponentFramework.Context<IInputs>): void {
        this.renderComponent();
      }
    
    private renderComponent(): void {
        if (this.imageUrl && !this.imageUrl.includes('undefined') && this.imageUrl1 && !this.imageUrl1.includes('undefined') && this.imageUrl && !this.imageUrl.includes('undefined')) {
            console.log("DDFFFFFFD", this.imageUrl)
            ReactDOM.render(React.createElement(App, { imageUrl: this.imageUrl, imageUrl1: this.imageUrl1, imageUrl2: this.imageUrl2 }), this.container);
        }
        // else if (this.imageUrl1 && !this.imageUrl1.includes('undefined')) {
            
        //     ReactDOM.render(React.createElement(App, { imageUrl1: this.imageUrl1 }), this.container);
        // } else if (this.imageUrl2 && !this.imageUrl2.includes('undefined')) {
            
        //     ReactDOM.render(React.createElement(App, { imageUrl2: this.imageUrl2 }), this.container);
        // }
        else {
            ReactDOM.render(React.createElement(App), this.container);
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
