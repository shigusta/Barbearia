import { Link } from "wouter";
import { Instagram, Facebook, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black py-12 border-t border-elite-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-display font-bold text-elite-gold mb-4">
              Lublack Hair
            </h3>
            <p className="text-gray-300 mb-4">
              Tradição, estilo e excelência em cada atendimento. Sua melhor versão começa aqui.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-elite-gold transition-colors duration-300"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-elite-gold transition-colors duration-300"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://wa.me/5561985526715"
                className="text-gray-400 hover:text-elite-gold transition-colors duration-300"
              >
                <Phone className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/">
                  <a className="hover:text-elite-gold transition-colors duration-300">
                    Início
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/servicos">
                  <a className="hover:text-elite-gold transition-colors duration-300">
                    Serviços
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/agendamento">
                  <a className="hover:text-elite-gold transition-colors duration-300">
                    Agendamento
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contato">
                  <a className="hover:text-elite-gold transition-colors duration-300">
                    Contato
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-gray-300">
              <p>St. Tradicional, Av. São paulo</p>
              <p>Brasilia, Planaltina-Df</p>
              <p>(61) 985526715</p>
            </div>
          </div>
        </div>

        <div className="border-t border-elite-gray mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Lublack Hair. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
