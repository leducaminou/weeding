// "use client";

// import { useState } from "react";
// import { Loader2 } from "lucide-react";
// import { Gender } from "@prisma/client";

// interface Item {
//   id: string;
//   weddingId: String;
//   firstName: String;
//   lastName:  String | null;
//   gender:  Gender | null;
//   phone:     String | null;
//   email:     String | null;
// }

// interface Props {
//   open: boolean;
//   item?: Item;
//   onClose: () => void;
//   onSaved: () => void;
// }

// export function InvitesFormDialog({ open, item, onClose, onSaved }: Props) {
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   if (!open) return null;

//   async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setSubmitting(true);
//     setError(null);

//     const formData = new FormData(e.currentTarget);
//     const payload = {
//       weddingId: String(formData.get("weddingId") ?? ""),
//       firstName: String(formData.get("firstName") ?? ""),
//       lastName: String(formData.get("lastName") ?? "") || null,
//       gender: String(formData.get("gender") ?? "") || null,
//       phone: String(formData.get("phone") ?? "") || null,
//       email: String(formData.get("email") ?? "") || null,
    
//     };

//     try {
//       const url = item
//         ? `/api/admin/guests/${item.id}`
//         : "/api/admin/guests";
//       const method = item ? "PATCH" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error ?? "Erreur");
//         setSubmitting(false);
//         return;
//       }

//       onSaved();
//     } catch {
//       setError("Erreur serveur");
//       setSubmitting(false);
//     }
//   }

//   const inputCls =
//     "mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//       <div className="w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
//         <form onSubmit={onSubmit} className="p-6">
//           <h2 className="text-lg font-semibold text-slate-900 mb-5">
//             {item ? "Modifier" : "Nouvel élément"}
//           </h2>

//           <div className="space-y-4">
//             <div>
//               <label className="text-xs text-slate-500 uppercase tracking-wide">
//                 Titre *
//               </label>
//               <select required className={inputCls} defaultValue={item?.gender ?? ""}>
//                 <option >Selectionnez</option>
//                 <option value={Gender.Mr}>Mr</option>
//                 <option value={Gender.Mme}>Mme</option>
//                 <option value={Gender.Mlle}>Mlle</option>
//                 <option value={Gender.Dr}>Dr</option>
//                 <option value={Gender.Maitre}>Maitre</option>
//               </select>
//             </div>
         
//             <div>
//               <label className="text-xs text-slate-500 uppercase tracking-wide">
//                 Nom *
//               </label>
//               <input name="firstName" defaultValue={item?.firstName} required className={inputCls} />
//             </div>
        
//             <div>
//               <label className="text-xs text-slate-500 uppercase tracking-wide">
//                 Whatsapp
//               </label>
//               <input name="phone" defaultValue={item?.phone ?? ""} className={inputCls} />
//             </div>
//             <div>
//               <label className="text-xs text-slate-500 uppercase tracking-wide">
//                 Email
//               </label>
//               <input name="email" defaultValue={item?.email ?? ""} className={inputCls} />
//             </div>
           
        
//           </div>

//           {error && <p className="mt-4 text-xs text-red-600 text-center">{error}</p>}

//           <div className="flex justify-end gap-2 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="h-10 px-4 text-sm text-slate-600 hover:text-slate-900"
//             >
//               Annuler
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="h-10 px-4 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2"
//             >
//               {submitting && <Loader2 size={14} className="animate-spin" />}
//               Enregistrer
//             </button>
//           </div>
//         </form>
//       </div>
 
 
//     </div>
//   );
// }