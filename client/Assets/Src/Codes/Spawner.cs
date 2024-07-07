using System.Collections;
using System.Collections.Generic;
using UnityEngine;
public class Spawner : MonoBehaviour
{
    public static Spawner instance;
    private HashSet<string> currentUsers = new HashSet<string>();
    
    void Awake() {
        instance = this;
    }

    public void Spawn(LocationUpdate data) {
        if (!GameManager.instance.isLive) {
            return;
        }
        
        HashSet<string> newUsers = new HashSet<string>();

        foreach(LocationUpdate.UserLocation user in data.users) {
            Player currentPlayer = GameManager.instance.player;
            if (user.id == currentPlayer.deviceId) {
                // Vector2 nextVec = new Vector2(user.x - currentPlayer.transform.position.x, user.y - currentPlayer.transform.position.y);
                // GameManager.instance.player.MoveToNextPosition(nextVec);
                // -----
                // Vector2 nextVec = new Vector2(user.x, user.y);
                // GameManager.instance.player.transform.position = nextVec;
                // -----
                Vector2 nextVec = new Vector2(user.x, user.y);
                GameManager.instance.player.MoveToNextPosition(nextVec);
                continue;
            }
            newUsers.Add(user.id);

            GameObject player = GameManager.instance.pool.Get(user);
            PlayerPrefab playerScript = player.GetComponent<PlayerPrefab>();
            playerScript.UpdatePosition(user.x, user.y);
        }

        foreach (string userId in currentUsers) {
            if (!newUsers.Contains(userId)) {
                GameManager.instance.pool.Remove(userId);
            }
        }
        
        currentUsers = newUsers;
    }
}