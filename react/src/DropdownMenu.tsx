import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Icon } from './icons/icon';

export enum DropdownItem {
    Divider,
}

type DropdownMenuProps = {
    commands: Array<DropdownMenuCommand | DropdownItem>;
    placement?: 'bottomRight';
    disabled?: boolean;
    children?: React.ReactNode;
    onMenuClick?: () => void;
};

export function DropdownMenu(props: DropdownMenuProps): React.ReactElement {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="flex h-6 w-6 items-center justify-center rounded-lg text-faded hover:bg-highlight hover:text-default focus:outline-none">
                    {props.children}
                </Menu.Button>
            </div>

            <Transition
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-background py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:shadow-faded/25">
                    {props.commands.map((option, index) =>
                        option == DropdownItem.Divider ? (
                            <DropdownMenuDivider key={index} />
                        ) : (
                            <DropdownMenuItem key={option.id} command={option} />
                        ),
                    )}
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

export function DropdownMenuDivider(): React.ReactElement {
    return <div className="my-1 h-px bg-divider" />;
}

export type DropdownMenuCommand = {
    id: string;
    callback: () => void;
    icon: Icon | null;
    text: string;
    keys: string | null;
};

type DropdownMenuItemProps = {
    command: DropdownMenuCommand;
};

/**
 * A single dropdown item.
 *
 * Accepts a command to avoid accidentally creating actions that won't end up in Cmd+K.
 */
export function DropdownMenuItem({ command }: DropdownMenuItemProps): React.ReactElement {
    return (
        <Menu.Item>
            <div
                className="group/dropdown-item px-2 text-[13px] font-semibold text-default"
                onClick={() => {
                    command.callback();
                }}
                key={command.id}
            >
                <div className="flex justify-between rounded-md px-2 py-1 group-hover/dropdown-item:bg-highlight">
                    <div className="flex items-center">
                        <div className="mr-3 flex w-3 items-center justify-center">
                            {command.icon && <command.icon className="h-3 w-3" />}
                        </div>
                        <div>{command.text}</div>
                    </div>
                </div>
            </div>
        </Menu.Item>
    );
}

const styles: Record<string, React.CSSProperties> = {
    menu: {
        marginTop: -3,
        position: 'relative' as const,
        display: 'inline-block',
        paddingTop: 4,
        paddingBottom: 4,
        zIndex: 1000,
        width: '300px',
    },
    item: {
        height: 32,
        lineHeight: '32px',
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 4,
        marginRight: 4,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 4,
        fontSize: 14,
    },
    shortcut: {
        color: '#7a8694',
        paddingLeft: 40,
        fontSize: 12,
    },
    divider: {
        marginTop: 4,
        marginBottom: 4,
        borderTop: `1px solid #d9e2ec`,
    },
};

export const dropdownStyles = styles;
