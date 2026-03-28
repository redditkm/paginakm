export default function ContactButton() {
  const phoneNumber = "18006839337";

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const handleClick = () => {
    if (isMobile()) {
      // 📱 Abrir llamada
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // 💻 WhatsApp Web
      window.open(`https://wa.me/${phoneNumber}`, "_blank");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="mt-8 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full text-lg shadow-xl hover:scale-105 transition-all"
    >
      Contáctanos
    </button>
  );
}
