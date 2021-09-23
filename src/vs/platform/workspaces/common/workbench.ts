/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coder Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { UriComponents } from 'vs/base/common/uri';
import { IProductConfiguration } from 'vs/base/common/product';
import { LogLevel } from 'vs/platform/log/common/log';
// eslint-disable-next-line code-layering, code-import-patterns
import { NLSConfiguration, InternalNLSConfiguration } from 'vs/base/node/languagePacks';
/**
 * A workspace to open in the workbench can either be:
 * - a workspace file with 0-N folders (via `workspaceUri`)
 * - a single folder (via `folderUri`)
 * - empty (via `undefined`)
 * @remark This is commonly used when initializing from web.
 */
export interface IWebWorkspace {
	folderUri?: UriComponents | undefined;
	workspaceUri?: UriComponents | undefined;
}

/**
 * @coder A list of known payload keys.
 * @remark This should probably be sent upstream to match `BrowserWorkbenchEnvironmentService`
 * This allows for JSON serialization when passing options to a client.
 */
export type IPayloadKeys =
	| 'debugId'
	| 'debugRenderer'
	| 'enableProposedApi'
	| 'extensionDevelopmentKind'
	| 'extensionDevelopmentPath'
	| 'extensionTestsPath'
	| 'inspect-brk-extensions'
	| 'inspect-extensions'
	| 'logLevel'
	| 'userDataPath'
	| 'disableExtensions'
	| 'logExtensionHostCommunication'
	| 'skipWelcome'
	| 'verbose'
	| 'webviewExternalEndpointCommit';

/**
* @coder Similar to the workspace provider, without `open` helper.
* This allows for JSON serialization when passing options to a client.
*/
export interface IWebWorkspaceProvider {
	payload: Array<[IPayloadKeys, string]>;
	workspace?: IWebWorkspace
}

interface ISettingsSyncOptionsSerialized {

	/**
	 * Is settings sync enabled
	 */
	readonly enabled: boolean;

	/**
	 * Version of extensions sync state.
	 * Extensions sync state will be reset if version is provided and different from previous version.
	 */
	readonly extensionsSyncStateVersion?: string;
}

/**
 * @coder Standard workbench constructor options with additional server paths.
 * @remark See `IWorkbenchConstructionOptions` for the client-side.
 */
export interface IWorkbenchConfigurationSerialized extends IWebWorkspace {
	readonly remoteAuthority: string;

	readonly nlsConfiguration: NLSConfiguration | InternalNLSConfiguration;

	readonly productConfiguration: Partial<IProductConfiguration> & Pick<IProductConfiguration, 'logoutEndpointUrl'>;

	/**
	 * An endpoint to serve iframe content ("webview") from. This is required
	 * to provide full security isolation from the workbench host.
	 */
	readonly webviewEndpoint: string;

	/**
	 * A handler for opening workspaces and providing the initial workspace.
	 */
	readonly workspaceProvider: IWebWorkspaceProvider;

	/**
	 * Settings sync options
	 */
	readonly settingsSyncOptions?: ISettingsSyncOptionsSerialized;

	readonly developmentOptions?: IDevelopmentOptionsSerialized;
}

interface IDevelopmentOptionsSerialized {
	/**
	 * Current logging level. Default is `LogLevel.Info`.
	 */
	readonly logLevel?: LogLevel;
}
