export default function AnimatedSection({ children, delay = 0, className = "", style = {} }) {
  return (
    <section className={className} style={style}>
      {children}
    </section>
  );
}
