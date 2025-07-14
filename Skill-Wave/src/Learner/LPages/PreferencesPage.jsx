import React, { useState, useEffect } from "react";
import { Card } from "../LComponents/UI/card";
import { Button } from "../LComponents/UI/Button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../LComponents/UI/select";
import { auth, db } from "../../Firebase";
import { doc, collection, setDoc, getDoc, getDocs } from "firebase/firestore";

export default function PreferencesPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    currentSkills: "",
    desiredSkills: "",
    futureGoals: "",
    category: "",
    subcategory: "",
  });

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const querySnapshot = await getDocs(categoriesRef);
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.category) {
        setSubcategories([]);
        return;
      }

      try {
        const subcategoriesRef = collection(db, `categories/${formData.category}/subcategories`);
        const querySnapshot = await getDocs(subcategoriesRef);
        const subcategoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchSubcategories();
  }, [formData.category]);

  useEffect(() => {
    const fetchPreferences = async (authUser) => {
      try {
        const userRef = doc(db, "users", authUser.uid);
        const preferencesRef = doc(
          collection(userRef, "preferences"),
          "userPreferences"
        );
        const docSnap = await getDoc(preferencesRef);

        if (docSnap.exists()) {
          const firestoreData = docSnap.data();

          const selectedCategory = firestoreData.category || "";
          const selectedSubcategory = firestoreData.subcategory || "";

          setFormData({
            currentSkills: firestoreData.currentSkills?.join(", ") || "",
            desiredSkills: firestoreData.wantToLearn?.join(", ") || "",
            futureGoals: firestoreData.futureGoals || "",
            category: selectedCategory,
            subcategory: selectedSubcategory,
          });

          const userData = JSON.parse(localStorage.getItem("userData")) || {};
          const updatedData = {
            ...userData,
            preferences: {
              categories: [selectedCategory],
              subCategories: [selectedSubcategory],
              topics: [
                ...new Set([
                  ...(firestoreData.currentSkills || []),
                  ...(firestoreData.wantToLearn || []),
                ]),
              ],
            },
          };
          localStorage.setItem("userData", JSON.stringify(updatedData));
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        fetchPreferences(authUser);
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        setUser({
          ...authUser,
          preferences: userData.preferences || { topics: [] },
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const currentSkillsArray = formData.currentSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const desiredSkillsArray = formData.desiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    const updatedData = {
      ...userData,
      preferences: {
        categories: [formData.category],
        subCategories: [formData.subcategory],
        topics: [...new Set([...currentSkillsArray, ...desiredSkillsArray])],
      },
    };
    localStorage.setItem("userData", JSON.stringify(updatedData));

    try {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const preferencesRef = doc(
          collection(userRef, "preferences"),
          "userPreferences"
        );

        await setDoc(
          preferencesRef,
          {
            category: formData.category,
            subcategory: formData.subcategory,
            currentSkills: currentSkillsArray,
            wantToLearn: desiredSkillsArray,
            futureGoals: formData.futureGoals,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error saving preferences to Firestore: ", error);
    }

    setUser((prev) => ({
      ...prev,
      preferences: updatedData.preferences,
    }));

    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTextAreaChange = (e, field) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [field]: value }));
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Learning Preferences
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-gray-500 mt-3 max-w-2xl mx-auto"
        >
          Customize your learning experience to match your skills, goals, and
          interests
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Dropdown */}
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-800">
                  Learning Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value,
                      subcategory: "", // Reset subcategory when category changes
                    }))
                  }
                >
                  <SelectTrigger className="w-full h-12 px-4 border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="px-4 py-2 hover:bg-gray-50 focus:bg-gray-50"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Dropdown */}
              {formData.category && (
                <div className="space-y-3">
                  <label className="block text-lg font-medium text-gray-800">
                    Subcategory
                  </label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcategory: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full h-12 px-4 border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                      {subcategories.map((subcategory) => (
                        <SelectItem
                          key={subcategory.id}
                          value={subcategory.id}
                          className="px-4 py-2 hover:bg-gray-50 focus:bg-gray-50"
                        >
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Current Skills */}
            <div className="space-y-3">
              <label className="block text-lg font-medium text-gray-800">
                Current Skills
              </label>
              <textarea
                value={formData.currentSkills}
                onChange={(e) => handleTextAreaChange(e, "currentSkills")}
                placeholder="JavaScript, Python, React, etc."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-none"
              />
              <p className="text-sm text-gray-500">
                Separate skills with commas. These help us recommend appropriate
                content.
              </p>
            </div>

            {/* Desired Skills */}
            <div className="space-y-3">
              <label className="block text-lg font-medium text-gray-800">
                Skills to Learn
              </label>
              <textarea
                value={formData.desiredSkills}
                onChange={(e) => handleTextAreaChange(e, "desiredSkills")}
                placeholder="AI, Cloud Computing, Mobile Development, etc."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-none"
              />
              <p className="text-sm text-gray-500">
                We'll prioritize content that helps you acquire these skills.
              </p>
            </div>

            {/* Future Goals */}
            <div className="space-y-3">
              <label className="block text-lg font-medium text-gray-800">
                Career Goals
              </label>
              <textarea
                value={formData.futureGoals}
                onChange={(e) => handleTextAreaChange(e, "futureGoals")}
                placeholder="Describe your career aspirations and objectives..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-none"
              />
              <p className="text-sm text-gray-500">
                Helps us tailor learning paths to your professional goals.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  (!formData.currentSkills && !formData.desiredSkills)
                }
                className="relative min-w-[180px] h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 bg-white border border-green-100 shadow-lg rounded-lg px-5 py-3 flex items-center gap-3"
          >
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Preferences saved!</p>
              <p className="text-sm text-gray-500">
                Your learning experience is now personalized
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}