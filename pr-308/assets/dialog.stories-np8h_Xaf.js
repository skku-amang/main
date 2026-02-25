import{j as e,c as p}from"./utils-yxTRs_G-.js";import{B as u}from"./button-BwlOegoO.js";import{r as i}from"./iframe-IETbCrGj.js";import{u as re,P as D,c as m,a as se,b as ie,d as le}from"./index-D_n7bfnB.js";import{u as I}from"./index-1UjhTyju.js";import{u as E,P as ce,h as de,R as ue,a as ge,F as pe,D as fe}from"./index-CVq0hg0-.js";import{P}from"./index-6ZluqA8O.js";import{c as B}from"./createLucideIcon-BPUWUB_w.js";import{C as me}from"./circle-alert-BhdwjGh8.js";import"./index-C3NjZfsJ.js";import"./preload-helper-PPVm8Dsz.js";import"./index-B0pCmSTE.js";const De=B("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);const xe=B("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);var O="Dialog",[k]=se(O),[he,d]=k(O),$=t=>{const{__scopeDialog:o,children:n,open:r,defaultOpen:s,onOpenChange:a,modal:c=!0}=t,l=i.useRef(null),f=i.useRef(null),[T,b]=re({prop:r,defaultProp:s??!1,onChange:a,caller:O});return e.jsx(he,{scope:o,triggerRef:l,contentRef:f,contentId:E(),titleId:E(),descriptionId:E(),open:T,onOpenChange:b,onOpenToggle:i.useCallback(()=>b(ae=>!ae),[b]),modal:c,children:n})};$.displayName=O;var W="DialogTrigger",H=i.forwardRef((t,o)=>{const{__scopeDialog:n,...r}=t,s=d(W,n),a=I(o,s.triggerRef);return e.jsx(D.button,{type:"button","aria-haspopup":"dialog","aria-expanded":s.open,"aria-controls":s.contentId,"data-state":F(s.open),...r,ref:a,onClick:m(t.onClick,s.onOpenToggle)})});H.displayName=W;var w="DialogPortal",[ve,L]=k(w,{forceMount:void 0}),G=t=>{const{__scopeDialog:o,forceMount:n,children:r,container:s}=t,a=d(w,o);return e.jsx(ve,{scope:o,forceMount:n,children:i.Children.map(r,c=>e.jsx(P,{present:n||a.open,children:e.jsx(ce,{asChild:!0,container:s,children:c})}))})};G.displayName=w;var R="DialogOverlay",z=i.forwardRef((t,o)=>{const n=L(R,t.__scopeDialog),{forceMount:r=n.forceMount,...s}=t,a=d(R,t.__scopeDialog);return a.modal?e.jsx(P,{present:r||a.open,children:e.jsx(Ce,{...s,ref:o})}):null});z.displayName=R;var je=ie("DialogOverlay.RemoveScroll"),Ce=i.forwardRef((t,o)=>{const{__scopeDialog:n,...r}=t,s=d(R,n);return e.jsx(ue,{as:je,allowPinchZoom:!0,shards:[s.contentRef],children:e.jsx(D.div,{"data-state":F(s.open),...r,ref:o,style:{pointerEvents:"auto",...r.style}})})}),g="DialogContent",V=i.forwardRef((t,o)=>{const n=L(g,t.__scopeDialog),{forceMount:r=n.forceMount,...s}=t,a=d(g,t.__scopeDialog);return e.jsx(P,{present:r||a.open,children:a.modal?e.jsx(Ne,{...s,ref:o}):e.jsx(ye,{...s,ref:o})})});V.displayName=g;var Ne=i.forwardRef((t,o)=>{const n=d(g,t.__scopeDialog),r=i.useRef(null),s=I(o,n.contentRef,r);return i.useEffect(()=>{const a=r.current;if(a)return de(a)},[]),e.jsx(X,{...t,ref:s,trapFocus:n.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:m(t.onCloseAutoFocus,a=>{a.preventDefault(),n.triggerRef.current?.focus()}),onPointerDownOutside:m(t.onPointerDownOutside,a=>{const c=a.detail.originalEvent,l=c.button===0&&c.ctrlKey===!0;(c.button===2||l)&&a.preventDefault()}),onFocusOutside:m(t.onFocusOutside,a=>a.preventDefault())})}),ye=i.forwardRef((t,o)=>{const n=d(g,t.__scopeDialog),r=i.useRef(!1),s=i.useRef(!1);return e.jsx(X,{...t,ref:o,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:a=>{t.onCloseAutoFocus?.(a),a.defaultPrevented||(r.current||n.triggerRef.current?.focus(),a.preventDefault()),r.current=!1,s.current=!1},onInteractOutside:a=>{t.onInteractOutside?.(a),a.defaultPrevented||(r.current=!0,a.detail.originalEvent.type==="pointerdown"&&(s.current=!0));const c=a.target;n.triggerRef.current?.contains(c)&&a.preventDefault(),a.detail.originalEvent.type==="focusin"&&s.current&&a.preventDefault()}})}),X=i.forwardRef((t,o)=>{const{__scopeDialog:n,trapFocus:r,onOpenAutoFocus:s,onCloseAutoFocus:a,...c}=t,l=d(g,n),f=i.useRef(null),T=I(o,f);return ge(),e.jsxs(e.Fragment,{children:[e.jsx(pe,{asChild:!0,loop:!0,trapped:r,onMountAutoFocus:s,onUnmountAutoFocus:a,children:e.jsx(fe,{role:"dialog",id:l.contentId,"aria-describedby":l.descriptionId,"aria-labelledby":l.titleId,"data-state":F(l.open),...c,ref:T,onDismiss:()=>l.onOpenChange(!1)})}),e.jsxs(e.Fragment,{children:[e.jsx(_e,{titleId:l.titleId}),e.jsx(Oe,{contentRef:f,descriptionId:l.descriptionId})]})]})}),A="DialogTitle",q=i.forwardRef((t,o)=>{const{__scopeDialog:n,...r}=t,s=d(A,n);return e.jsx(D.h2,{id:s.titleId,...r,ref:o})});q.displayName=A;var K="DialogDescription",U=i.forwardRef((t,o)=>{const{__scopeDialog:n,...r}=t,s=d(K,n);return e.jsx(D.p,{id:s.descriptionId,...r,ref:o})});U.displayName=K;var Y="DialogClose",Z=i.forwardRef((t,o)=>{const{__scopeDialog:n,...r}=t,s=d(Y,n);return e.jsx(D.button,{type:"button",...r,ref:o,onClick:m(t.onClick,()=>s.onOpenChange(!1))})});Z.displayName=Y;function F(t){return t?"open":"closed"}var J="DialogTitleWarning",[Ve,Q]=le(J,{contentName:g,titleName:A,docsSlug:"dialog"}),_e=({titleId:t})=>{const o=Q(J),n=`\`${o.contentName}\` requires a \`${o.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${o.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${o.docsSlug}`;return i.useEffect(()=>{t&&(document.getElementById(t)||console.error(n))},[n,t]),null},Re="DialogDescriptionWarning",Oe=({contentRef:t,descriptionId:o})=>{const r=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${Q(Re).contentName}}.`;return i.useEffect(()=>{const s=t.current?.getAttribute("aria-describedby");o&&s&&(document.getElementById(o)||console.warn(r))},[r,t,o]),null},Te=$,be=H,Ee=G,ee=z,te=V,oe=q,ne=U,Ie=Z;const M=Te,Pe=be,we=Ee,S=i.forwardRef(({className:t,...o},n)=>e.jsx(ee,{ref:n,className:p("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",t),...o}));S.displayName=ee.displayName;const x=i.forwardRef(({className:t,children:o,...n},r)=>e.jsxs(we,{children:[e.jsx(S,{}),e.jsxs(te,{ref:r,className:p("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",t),...n,children:[o,e.jsxs(Ie,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[e.jsx(xe,{className:"h-4 w-4"}),e.jsx("span",{className:"sr-only",children:"Close"})]})]})]}));x.displayName=te.displayName;const h=({className:t,...o})=>e.jsx("div",{className:p("flex flex-col space-y-1.5 text-center sm:text-left",t),...o});h.displayName="DialogHeader";const v=({className:t,...o})=>e.jsx("div",{className:p("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...o});v.displayName="DialogFooter";const j=i.forwardRef(({className:t,...o},n)=>e.jsx(oe,{ref:n,className:p("text-lg font-semibold leading-none tracking-tight",t),...o}));j.displayName=oe.displayName;const C=i.forwardRef(({className:t,...o},n)=>e.jsx(ne,{ref:n,className:p("text-sm text-muted-foreground",t),...o}));C.displayName=ne.displayName;x.__docgenInfo={description:"",methods:[]};C.__docgenInfo={description:"",methods:[]};v.__docgenInfo={description:"",methods:[],displayName:"DialogFooter"};h.__docgenInfo={description:"",methods:[],displayName:"DialogHeader"};S.__docgenInfo={description:"",methods:[]};j.__docgenInfo={description:"",methods:[]};const Xe={title:"ui/Dialog",tags:["autodocs"]},N={render:()=>e.jsxs(M,{children:[e.jsx(Pe,{asChild:!0,children:e.jsx(u,{children:"Open Dialog"})}),e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsx(j,{children:"Dialog Title"}),e.jsx(C,{children:"This is a basic dialog description."})]}),e.jsxs(v,{children:[e.jsx(u,{variant:"outline",children:"취소"}),e.jsx(u,{children:"확인"})]})]})]})},y={render:()=>e.jsx(M,{defaultOpen:!0,children:e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(De,{className:"h-5 w-5 text-primary"}),e.jsx(j,{children:"정말로 지원하시겠습니까?"})]}),e.jsx(C,{children:"이미 신청한 팀이 있으면 팀장에게 알려야 할 수도 있습니다."})]}),e.jsxs(v,{children:[e.jsx(u,{variant:"outline",children:"취소"}),e.jsx(u,{children:"확인"})]})]})})},_={render:()=>e.jsx(M,{defaultOpen:!0,children:e.jsxs(x,{children:[e.jsxs(h,{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(me,{className:"h-5 w-5 text-destructive"}),e.jsx(j,{children:"세션 지원이 취소되었습니다"})]}),e.jsx(C,{children:"이 작업은 되돌릴 수 없습니다."})]}),e.jsxs(v,{children:[e.jsx(u,{variant:"outline",children:"취소"}),e.jsx(u,{variant:"destructive",children:"확인"})]})]})})};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog description.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...N.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <DialogTitle>정말로 지원하시겠습니까?</DialogTitle>
          </div>
          <DialogDescription>
            이미 신청한 팀이 있으면 팀장에게 알려야 할 수도 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,...y.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <DialogTitle>세션 지원이 취소되었습니다</DialogTitle>
          </div>
          <DialogDescription>이 작업은 되돌릴 수 없습니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">취소</Button>
          <Button variant="destructive">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
}`,..._.parameters?.docs?.source}}};const qe=["Basic","Success","Alert"];export{_ as Alert,N as Basic,y as Success,qe as __namedExportsOrder,Xe as default};
