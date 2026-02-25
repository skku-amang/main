import{j as r}from"./utils-yxTRs_G-.js";import{B as e}from"./button-BwlOegoO.js";import"./iframe-IETbCrGj.js";import"./preload-helper-PPVm8Dsz.js";import"./index-1UjhTyju.js";import"./index-C3NjZfsJ.js";const{fn:m}=__STORYBOOK_MODULE_TEST__,B={title:"ui/Button",component:e,tags:["autodocs"],args:{onClick:m()},argTypes:{variant:{control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{control:"select",options:["default","sm","lg","icon"]},disabled:{control:"boolean"}}},a={args:{children:"Button",variant:"default",size:"default"}},n={args:{children:"Delete",variant:"destructive"}},t={args:{children:"Outline",variant:"outline"}},s={args:{children:"Secondary",variant:"secondary"}},o={args:{children:"Ghost",variant:"ghost"}},i={args:{children:"Link",variant:"link"}},c={args:{children:"Small",size:"sm"}},l={args:{children:"Large",size:"lg"}},d={args:{children:"Disabled",disabled:!0}},u={render:()=>r.jsxs("div",{className:"flex flex-wrap gap-4",children:[r.jsx(e,{variant:"default",children:"Default"}),r.jsx(e,{variant:"destructive",children:"Destructive"}),r.jsx(e,{variant:"outline",children:"Outline"}),r.jsx(e,{variant:"secondary",children:"Secondary"}),r.jsx(e,{variant:"ghost",children:"Ghost"}),r.jsx(e,{variant:"link",children:"Link"})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Button",
    variant: "default",
    size: "default"
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Delete",
    variant: "destructive"
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Outline",
    variant: "outline"
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Secondary",
    variant: "secondary"
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Ghost",
    variant: "ghost"
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Link",
    variant: "link"
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Small",
    size: "sm"
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Large",
    size: "lg"
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    children: "Disabled",
    disabled: true
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
}`,...u.parameters?.docs?.source}}};const x=["Default","Destructive","Outline","Secondary","Ghost","Link","Small","Large","Disabled","AllVariants"];export{u as AllVariants,a as Default,n as Destructive,d as Disabled,o as Ghost,l as Large,i as Link,t as Outline,s as Secondary,c as Small,x as __namedExportsOrder,B as default};
