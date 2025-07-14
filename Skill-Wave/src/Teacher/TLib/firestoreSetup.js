// utils/firestoreSetup.js
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../Firebase";

// Initialize default categories if they don't exist
export const initializeDefaultCategories = async () => {
  const defaultStructure = {
    "Web Development": ["Frontend", "Backend", "Full Stack"],
    "Data Science": ["Machine Learning", "Data Engineering", "Deep Learning"],
    "AI & Robotics": ["Computer Vision", "NLP", "Reinforcement Learning"],
    "Cloud Computing": ["AWS", "Azure", "Google Cloud"],
    "Cybersecurity": ["Network Security", "Ethical Hacking", "Cryptography"]
  };

  const categoriesRef = collection(db, "Categories");
  const snapshot = await getDocs(categoriesRef);

  // Only initialize if no categories exist
  if (snapshot.empty) {
    for (const [category, subcategories] of Object.entries(defaultStructure)) {
      const categoryRef = doc(categoriesRef, category);
      await setDoc(categoryRef, { name: category });
      
      const subcategoriesRef = collection(categoryRef, "Subcategories");
      for (const subcategory of subcategories) {
        const subcategoryRef = doc(subcategoriesRef, subcategory);
        await setDoc(subcategoryRef, { 
          name: subcategory,
          topics: [] 
        });
      }
    }
  }
};