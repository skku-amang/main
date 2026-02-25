import{t as e}from"./iframe-4u_nmTCU.js";import{L as o}from"./label-azELMX9F.js";import{S as t,a as c,b as s,c as a,d as l}from"./select-D6H4dMxF.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Dlqk1v4Q.js";import"./index-CLCjRePM.js";import"./index-DtCGojcc.js";import"./index-Drd88ecX.js";import"./utils-d2XQ1MEC.js";import"./index-BeuvYYRa.js";import"./index-DeHom2lG.js";import"./index-BllzpNx8.js";import"./index-cW8JO0OK.js";import"./createLucideIcon-CEhoHEEZ.js";import"./index-Mov3KFrP.js";const w={title:"ui/Select",tags:["autodocs"]},r={render:()=>e.jsxs(t,{children:[e.jsx(c,{className:"w-[200px]",children:e.jsx(s,{placeholder:"Select"})}),e.jsxs(a,{children:[e.jsx(l,{value:"guitar",children:"기타"}),e.jsx(l,{value:"mic",children:"마이크"}),e.jsx(l,{value:"mixer",children:"믹서"}),e.jsx(l,{value:"bass",children:"베이스"}),e.jsx(l,{value:"speaker",children:"스피커"})]})]})},n={render:()=>e.jsxs(t,{children:[e.jsx(c,{size:"lg",className:"w-[250px]",children:e.jsx(s,{placeholder:"Select"})}),e.jsxs(a,{children:[e.jsx(l,{value:"guitar",children:"기타"}),e.jsx(l,{value:"mic",children:"마이크"}),e.jsx(l,{value:"mixer",children:"믹서"}),e.jsx(l,{value:"bass",children:"베이스"})]})]})},i={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs(o,{children:["관련 신청"," ",e.jsx("span",{className:"text-muted-foreground",children:"선택을 입력하세요"})]}),e.jsxs(t,{children:[e.jsx(c,{className:"w-[250px]",children:e.jsx(s,{placeholder:"Select"})}),e.jsxs(a,{children:[e.jsx(l,{value:"2024-1",children:"2024 년 정기공연"}),e.jsx(l,{value:"2024-2",children:"2024 년 1월축제"}),e.jsx(l,{value:"2024-3",children:"2024 년 봄맞이공연"})]})]})]})},d={render:()=>e.jsxs(t,{disabled:!0,children:[e.jsx(c,{className:"w-[200px]",children:e.jsx(s,{placeholder:"Disabled"})}),e.jsx(a,{children:e.jsx(l,{value:"1",children:"Option 1"})})]})},m={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{children:"default (base)"}),e.jsxs(t,{children:[e.jsx(c,{className:"w-[250px]",children:e.jsx(s,{placeholder:"Default size"})}),e.jsxs(a,{children:[e.jsx(l,{value:"1",children:"Option 1"}),e.jsx(l,{value:"2",children:"Option 2"})]})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{children:"lg"}),e.jsxs(t,{children:[e.jsx(c,{size:"lg",className:"w-[250px]",children:e.jsx(s,{placeholder:"Large size"})}),e.jsxs(a,{children:[e.jsx(l,{value:"1",children:"Option 1"}),e.jsx(l,{value:"2",children:"Option 2"})]})]})]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="guitar">기타</SelectItem>
        <SelectItem value="mic">마이크</SelectItem>
        <SelectItem value="mixer">믹서</SelectItem>
        <SelectItem value="bass">베이스</SelectItem>
        <SelectItem value="speaker">스피커</SelectItem>
      </SelectContent>
    </Select>
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Select>
      <SelectTrigger size="lg" className="w-[250px]">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="guitar">기타</SelectItem>
        <SelectItem value="mic">마이크</SelectItem>
        <SelectItem value="mixer">믹서</SelectItem>
        <SelectItem value="bass">베이스</SelectItem>
      </SelectContent>
    </Select>
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <Label>
        관련 신청{" "}
        <span className="text-muted-foreground">선택을 입력하세요</span>
      </Label>
      <Select>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2024-1">2024 년 정기공연</SelectItem>
          <SelectItem value="2024-2">2024 년 1월축제</SelectItem>
          <SelectItem value="2024-3">2024 년 봄맞이공연</SelectItem>
        </SelectContent>
      </Select>
    </div>
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Select disabled>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Option 1</SelectItem>
      </SelectContent>
    </Select>
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label>default (base)</Label>
        <Select>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Default size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>lg</Label>
        <Select>
          <SelectTrigger size="lg" className="w-[250px]">
            <SelectValue placeholder="Large size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};const O=["Default","Large","WithLabel","Disabled","SizeComparison"];export{r as Default,d as Disabled,n as Large,m as SizeComparison,i as WithLabel,O as __namedExportsOrder,w as default};
