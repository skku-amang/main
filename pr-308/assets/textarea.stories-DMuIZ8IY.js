import{j as o,c as l}from"./utils-DiG1Kwwf.js";import{L as n}from"./label-BV4JD-Gt.js";import{r as p}from"./iframe-CR0wYihy.js";import"./index-D1imF-e3.js";import"./index-DCzllLXp.js";import"./index-CAbAnrKk.js";import"./preload-helper-PPVm8Dsz.js";const t=p.forwardRef(({className:d,...i},c)=>o.jsx("textarea",{className:l("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",d),ref:c,...i}));t.displayName="Textarea";t.__docgenInfo={description:"",methods:[],displayName:"Textarea"};const y={title:"ui/Textarea",component:t,tags:["autodocs"],argTypes:{disabled:{control:"boolean"}}},e={args:{placeholder:"Type your message here."}},r={args:{defaultValue:"동아리 활동에 대한 설명을 입력하세요."}},a={args:{placeholder:"Disabled textarea",disabled:!0}},s={render:()=>o.jsxs("div",{className:"space-y-2",children:[o.jsx(n,{htmlFor:"description",children:"장비 설명"}),o.jsx(t,{id:"description",placeholder:"예: 88 keys"})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Type your message here."
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "동아리 활동에 대한 설명을 입력하세요."
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Disabled textarea",
    disabled: true
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Label htmlFor="description">장비 설명</Label>
      <Textarea id="description" placeholder="예: 88 keys" />
    </div>
}`,...s.parameters?.docs?.source}}};const T=["Default","WithValue","Disabled","WithLabel"];export{e as Default,a as Disabled,s as WithLabel,r as WithValue,T as __namedExportsOrder,y as default};
