import axios from 'axios';

export const searchAnime = async(req, res) => {
    const {name} = req.query;
    if(!name) return res.status(400).json({ message: "Query parameter 'name' is required" });
    try{
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name)}&limit=5`);
        res.json(response.data.data);
    }
    catch(error){
        console.error("Error searching anime:", error);
        res.status(500).json({ message: "Internal Server Error (Jikan failed us)" });
    }
};

export const getTopAiring = async(req,res) =>{
    try{
        const response = await axios.get("https://api.jikan.moe/v4/top/anime?filter=airing");
        res.json(response.data.data);
    }
    catch(error){
        console.error("Error fetching top airing anime:", error);
        res.status(500).json({ message: "Internal Server Error (Jikan failed us)" });
    }
};