let createWithBsPrefix;module.link('./createWithBsPrefix',{default(v){createWithBsPrefix=v}},0);let FigureImage;module.link('./FigureImage',{default(v){FigureImage=v}},1);let FigureCaption;module.link('./FigureCaption',{default(v){FigureCaption=v}},2);


const Figure = createWithBsPrefix('figure', {
  Component: 'figure'
});
module.exportDefault(Object.assign(Figure, {
  Image: FigureImage,
  Caption: FigureCaption
}));