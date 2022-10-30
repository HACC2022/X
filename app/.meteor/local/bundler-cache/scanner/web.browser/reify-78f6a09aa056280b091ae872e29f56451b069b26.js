module.export({useForm:()=>useForm});let invariant;module.link('invariant',{default(v){invariant=v}},0);let useContext;module.link('react',{useContext(v){useContext=v}},1);let contextReference;module.link('./context',{context(v){contextReference=v}},2);


function useForm() {
    const context = useContext(contextReference);
    invariant(context !== null, `useForm must be used within a form.

Two most common reasons for this error are:
1. Component calling this function doesn't have a parent Form component in the tree.
2. A duplicate uniforms dependency is installed in node_modules.

For more info check FAQ: https://uniforms.tools/docs/faq/#useform-must-be-used-within-a-form
  `);
    return context;
}
