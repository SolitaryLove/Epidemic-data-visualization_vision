const theme={
    chalk:{
        // 背景颜色
        background:'#3e3d3d',
        // 标题颜色
        titleColor:'#ffffff',
        // 页面分隔线
        headerBorderSrc:'header_border_dark.png',
    },
    vintage:{
        // 背景颜色
        background:'#8ab7cc',
        // 标题颜色
        titleColor:'#000000',
        // 页面分隔线
        headerBorderSrc:'header_border_light.png',
    }
}

export function getThemeValue(themeName){
    return theme[themeName];
}