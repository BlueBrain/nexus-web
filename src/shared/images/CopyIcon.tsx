interface CopyIconProps {
    color?: string;
}

export const CopyIcon = ({color}: CopyIconProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" fill="none"><path fill={color ?? '#595959' } d="M11.333.5H4.667A.667.667 0 0 0 4 1.167v2H.667A.667.667 0 0 0 0 3.833v8c0 .368.298.667.667.667h6.666A.667.667 0 0 0 8 11.834v-2h3.333A.667.667 0 0 0 12 9.166v-8A.667.667 0 0 0 11.333.5ZM6.667 11.166H1.334V4.5h5.333v6.666Zm4-2.666H8V3.833a.667.667 0 0 0-.667-.666h-2V1.834h5.333V8.5Z"/></svg>
    )
}
