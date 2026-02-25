import{v as j,t as e}from"./iframe-BRPXIqtl.js";import{L as s}from"./label-DUmSwhMg.js";import{c as N}from"./index-Drd88ecX.js";import{c as f}from"./utils-d2XQ1MEC.js";import{C as L}from"./circle-alert-DHwH51y8.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BUfMtjD5.js";import"./index-6lrQp6Fv.js";import"./index-jidKNPsx.js";import"./createLucideIcon-DbcBBgSP.js";const b=N("flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground hover:shadow-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",{variants:{size:{sm:"h-8 px-2.5 py-1 text-xs",default:"h-10 px-3 py-2 text-sm file:text-sm",lg:"h-12 px-4 py-3 text-base"}},defaultVariants:{size:"default"}}),r=j.forwardRef(({className:u,type:m,size:x,error:v,...h},g)=>v?e.jsxs("div",{className:"relative",children:[e.jsx("input",{type:m,className:f(b({size:x}),"border-destructive pr-10 text-destructive focus-visible:ring-destructive",u),ref:g,...h}),e.jsx(L,{className:"absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive"})]}):e.jsx("input",{type:m,className:f(b({size:x}),u),ref:g,...h}));r.displayName="Input";r.__docgenInfo={description:"",methods:[],displayName:"Input",props:{error:{required:!1,tsType:{name:"boolean"},description:""}},composes:["Omit","VariantProps"]};const W={title:"ui/Input",component:r,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","default","lg"]},error:{control:"boolean"},disabled:{control:"boolean"}}},a={args:{placeholder:"Input text",size:"default"}},t={args:{placeholder:"Small input",size:"sm"}},l={args:{placeholder:"Large input",size:"lg"}},o={args:{placeholder:"Input text",error:!0,defaultValue:"잘못된 입력"}},n={args:{placeholder:"Input text",error:!0,size:"sm",defaultValue:"잘못된 입력"}},c={args:{placeholder:"Disabled input",disabled:!0}},i={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs(s,{htmlFor:"name",children:["이름 ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(r,{id:"name",placeholder:"성함을 입력하세요"})]})},d={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs(s,{htmlFor:"name-error",children:["이름 ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(r,{id:"name-error",placeholder:"Input text",error:!0,defaultValue:"Input text"}),e.jsx("p",{className:"text-xs text-destructive",children:"This is the error message"})]})},p={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(s,{children:"sm"}),e.jsx(r,{size:"sm",placeholder:"Small input"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(s,{children:"default (base)"}),e.jsx(r,{size:"default",placeholder:"Default input"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(s,{children:"lg"}),e.jsx(r,{size:"lg",placeholder:"Large input"})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Input text",
    size: "default"
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Small input",
    size: "sm"
  }
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Large input",
    size: "lg"
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Input text",
    error: true,
    defaultValue: "잘못된 입력"
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Input text",
    error: true,
    size: "sm",
    defaultValue: "잘못된 입력"
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Disabled input",
    disabled: true
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Label htmlFor="name">
        이름 <span className="text-destructive">*</span>
      </Label>
      <Input id="name" placeholder="성함을 입력하세요" />
    </div>
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Label htmlFor="name-error">
        이름 <span className="text-destructive">*</span>
      </Label>
      <Input id="name-error" placeholder="Input text" error defaultValue="Input text" />
      <p className="text-xs text-destructive">This is the error message</p>
    </div>
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label>sm</Label>
        <Input size="sm" placeholder="Small input" />
      </div>
      <div className="space-y-1">
        <Label>default (base)</Label>
        <Input size="default" placeholder="Default input" />
      </div>
      <div className="space-y-1">
        <Label>lg</Label>
        <Input size="lg" placeholder="Large input" />
      </div>
    </div>
}`,...p.parameters?.docs?.source}}};const _=["Default","Small","Large","WithError","ErrorSmall","Disabled","Labeled","LabeledWithError","AllSizes"];export{p as AllSizes,a as Default,c as Disabled,n as ErrorSmall,i as Labeled,d as LabeledWithError,l as Large,t as Small,o as WithError,_ as __namedExportsOrder,W as default};
